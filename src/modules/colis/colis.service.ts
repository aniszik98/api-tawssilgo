import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, MoreThan, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Colis, ColisStatut } from './colis.entity';
import { ColisHistorique } from './colis-historique.entity';
import { CreateColisDto } from './dto/create-colis.dto';
import { UpdateColisDto } from './dto/update-colis.dto';
import { ChangeStatutColisDto } from './dto/change-statut-colis.dto';
import { ColisQueryDto } from './dto/colis-query.dto';
import { LaravelSyncService } from '../laravel-sync/laravel-sync.service';
import { parseSince } from '../../common/utils/parse-since';

// Un push Laravel envoie comme « codeSuivi » l'identifiant (UUID) de la
// livraison dans le système source. Cet id sert de clé de réconciliation avec
// le pull (voir ColisService.create).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const estUuid = (v?: string | null): v is string => !!v && UUID_RE.test(v);

// Transitions de statut autorisées. Toute autre transition est rejetée,
// pour éviter des incohérences métier (ex: repasser "livrée" à "en_attente").
const TRANSITIONS_AUTORISEES: Record<string, string[]> = {
  [ColisStatut.EN_ATTENTE]: [ColisStatut.ATTRIBUE, ColisStatut.EN_INTERNE],
  [ColisStatut.ATTRIBUE]: [ColisStatut.EN_INTERNE, ColisStatut.DISPONIBLE, ColisStatut.RETOUR],
  [ColisStatut.EN_INTERNE]: [ColisStatut.DISPONIBLE, ColisStatut.ATTRIBUE, ColisStatut.RETOUR],
  [ColisStatut.DISPONIBLE]: [ColisStatut.LIVREE, ColisStatut.RETOUR],
  [ColisStatut.LIVREE]: [ColisStatut.CLOTUREE],
  [ColisStatut.RETOUR]: [ColisStatut.EN_ATTENTE, ColisStatut.CLOTUREE],
  [ColisStatut.CLOTUREE]: [],
};

// Colonne timestamp associée à chaque statut, pour tracer précisément quand
// le colis y est entré.
const TIMESTAMP_PAR_STATUT: Partial<Record<string, keyof Colis>> = {
  [ColisStatut.ATTRIBUE]: 'statutAttribueAt',
  [ColisStatut.EN_INTERNE]: 'statutEnInterneAt',
  [ColisStatut.DISPONIBLE]: 'statutDisponibleAt',
  [ColisStatut.LIVREE]: 'statutLivreeAt',
  [ColisStatut.CLOTUREE]: 'statutClottureeAt',
};

@Injectable()
export class ColisService {
  constructor(
    @InjectRepository(Colis)
    private readonly colisRepo: Repository<Colis>,
    @InjectRepository(ColisHistorique)
    private readonly historiqueRepo: Repository<ColisHistorique>,
    private readonly sync: LaravelSyncService,
  ) {}

  async create(dto: CreateColisDto, isSync = false): Promise<Colis> {
    // Le pull upsert les colis sur `id` (= id de la livraison Laravel). Quand un
    // push arrive avec codeSuivi = UUID de la livraison source, on ancre l'id du
    // colis sur cette valeur : le pull mettra alors à jour la même ligne au lieu
    // d'en insérer une seconde (dédoublonnage push/pull).
    // NB: on ne dépend PAS de l'en-tête x-sync-source, que le push colis
    // Laravel n'envoie pas toujours (les apps, elles, génèrent des « COL-… »).
    const idAncre = estUuid(dto.codeSuivi) ? dto.codeSuivi : undefined;
    const estPushSource = isSync || !!idAncre;

    if (estPushSource) {
      const existing =
        (dto.externalId
          ? await this.colisRepo.findOne({ where: { externalId: dto.externalId } })
          : null) ||
        (dto.codeSuivi
          ? await this.colisRepo.findOne({ where: { codeSuivi: dto.codeSuivi } })
          : null) ||
        (idAncre
          ? await this.colisRepo.findOne({ where: { id: idAncre } })
          : null);
      if (existing) {
        // codeSuivi reste géré par le pull (libellé Laravel) : on ne l'écrase
        // pas ici avec l'identifiant brut reçu du push.
        const codeSuiviCanonique = existing.codeSuivi;
        const { statut, ...rest } = dto;
        Object.assign(existing, rest);
        existing.codeSuivi = codeSuiviCanonique;
        if (statut) existing.statut = statut;
        return this.colisRepo.save(existing);
      }
    }

    const codeSuivi = dto.codeSuivi || this.genererCodeSuivi();
    const colis = this.colisRepo.create({
      ...dto,
      id: idAncre,
      codeSuivi,
      statut: isSync && dto.statut ? dto.statut : ColisStatut.EN_ATTENTE,
    });
    const saved = await this.colisRepo.save(colis);

    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        colisId: saved.id,
        nouveauStatut: saved.statut,
        commentaire: 'Création du colis',
        evenement: 'creation',
      }),
    );
    return saved;
  }

  async findAll(query: ColisQueryDto) {
    const { page, limit, search, statut, updatedSince } = query;
    const where: any = {};
    if (statut) where.statut = statut;
    if (search) where.codeSuivi = ILike(`%${search}%`);
    const since = parseSince(updatedSince);
    if (since) where.updatedAt = MoreThan(since);

    const [data, total] = await this.colisRepo.findAndCount({
      where,
      relations: ['partenaireRecepteur', 'livreur', 'client'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Colis> {
    const colis = await this.colisRepo.findOne({
      where: { id },
      relations: ['partenaireRecepteur', 'partenaireLivreur', 'livreur', 'client'],
    });
    if (!colis) throw new NotFoundException(`Colis ${id} introuvable`);
    return colis;
  }

  async findByCodeSuivi(codeSuivi: string): Promise<Colis> {
    const colis = await this.colisRepo.findOne({ where: { codeSuivi } });
    if (!colis) throw new NotFoundException(`Colis ${codeSuivi} introuvable`);
    return colis;
  }

  async update(id: string, dto: UpdateColisDto): Promise<Colis> {
    const colis = await this.findOne(id);
    Object.assign(colis, dto);
    return this.colisRepo.save(colis);
  }

  /**
   * Cœur de la logique métier : fait transitionner un colis d'un statut à un
   * autre, en validant la transition, en timestampant l'étape, et en gardant
   * une trace complète dans colis_historique.
   */
  async changerStatut(
    id: string,
    dto: ChangeStatutColisDto,
    isSync = false,
  ): Promise<Colis> {
    const colis = await this.findOne(id);
    const transitionsPossibles = TRANSITIONS_AUTORISEES[colis.statut] || [];

    if (!isSync && !transitionsPossibles.includes(dto.statut)) {
      throw new BadRequestException(
        `Transition invalide : ${colis.statut} → ${dto.statut}. Transitions possibles : ${transitionsPossibles.join(', ') || 'aucune'}`,
      );
    }

    if (!isSync && dto.statut === ColisStatut.RETOUR && !dto.retourMotif) {
      throw new BadRequestException('Le motif de retour est obligatoire pour ce statut');
    }

    const ancienStatut = colis.statut;
    colis.statut = dto.statut;

    const champTimestamp = TIMESTAMP_PAR_STATUT[dto.statut];
    if (champTimestamp) {
      (colis as any)[champTimestamp] = new Date();
    }

    if (dto.statut === ColisStatut.RETOUR) {
      colis.retourMotif = dto.retourMotif || '';
      colis.retourAt = new Date();
      colis.retourTentatives = (colis.retourTentatives || 0) + 1;
    }

    if (dto.livreurId) {
      colis.livreurId = dto.livreurId;
    }

    await this.colisRepo.save(colis);

    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        colisId: colis.id,
        role: dto.role || 'admin',
        nom: dto.nom,
        livreurId: dto.livreurId,
        ancienStatut,
        nouveauStatut: dto.statut,
        commentaire: dto.commentaire || '',
      }),
    );

    if (!isSync) {
      void this.sync.notifyColisStatut(colis, ancienStatut);
    }

    return colis;
  }

  async historique(colisId: string): Promise<ColisHistorique[]> {
    await this.findOne(colisId); // 404 si le colis n'existe pas
    return this.historiqueRepo.find({
      where: { colisId },
      order: { createdAt: 'ASC' },
    });
  }

  private genererCodeSuivi(): string {
    return `COL-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
  }
}
