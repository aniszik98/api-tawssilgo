import {
  BadRequestException,
  Injectable,
  Logger,
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
import {
  deriveStatut,
  extraireStatutLaravel,
  STATUT_LARAVEL_VERS_LIVRAISON,
  STATUT_LARAVEL_VERS_PAIEMENT,
} from './statut-axes';

// Un push Laravel envoie comme « codeSuivi » l'identifiant (UUID) de la
// livraison dans le système source. Cet id sert de clé de réconciliation avec
// le pull (voir ColisService.create).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const estUuid = (v?: string | null): v is string => !!v && UUID_RE.test(v);

// Certains pushes Laravel envoient aussi le numéro de suivi transporteur EcoTrack
// (ECVNAC…) comme « codeSuivi ». Ce n'est pas un code de suivi affichable et cela
// déborde dans les apps : on le refuse à la création, le pull posera le vrai
// label COLIS-… définitif.
const ECO_TRACK_RE = /^ECVNAC[A-Z0-9]+$/i;
const estCodeSuiviBrut = (v?: string | null): boolean =>
  !!v && (UUID_RE.test(v) || ECO_TRACK_RE.test(v.trim()));

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
  private readonly logger = new Logger(ColisService.name);

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

    // Le code de suivi affiché ne doit jamais être un identifiant brut du push
    // (UUID source ou numéro EcoTrack) : on génère un code « COL-… » à la place,
    // que le pull remplacera par le label COLIS-… définitif de Laravel.
    const codeSuivi =
      dto.codeSuivi && !estCodeSuiviBrut(dto.codeSuivi)
        ? dto.codeSuivi
        : this.genererCodeSuivi();
    // Les 2 axes sont la source de vérité : on les initialise toujours. Sans
    // cela un colis créé par push Laravel restait à NULL, et la règle de
    // protection du pull le figeait ensuite pour toujours (local ≠ external).
    const etapeLivraison = dto.etapeLivraison || 'en_attente';
    const etapePaiement = dto.etapePaiement || 'ouv';
    const colis = this.colisRepo.create({
      ...dto,
      id: idAncre,
      codeSuivi,
      etapeLivraison,
      etapePaiement,
      statut:
        isSync && dto.statut
          ? dto.statut
          : dto.statut || deriveStatut(etapeLivraison, etapePaiement),
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
   * autre. Les 2 axes (etape_livraison / etape_paiement) sont la source de
   * vérité ; `statut` en est DÉRIVÉ. L'intégration Laravel envoie un statut
   * grossier + le vrai statut dans le commentaire : on reconstruit les axes
   * depuis ce libellé (voir statut-axes.ts).
   */
  async changerStatut(
    id: string,
    dto: ChangeStatutColisDto,
    isSync = false,
  ): Promise<Colis> {
    const colis = await this.findOne(id);
    const ancienStatut = colis.statut;

    // 1) Détermine les 2 axes cibles. Priorité : axes explicites (nos apps) >
    //    statut brut Laravel lu dans le commentaire > statut reçu.
    let lv: string | null = colis.etapeLivraison || null;
    let pay: string | null = colis.etapePaiement || null;

    if (dto.etapeLivraison || dto.etapePaiement) {
      if (dto.etapeLivraison) lv = dto.etapeLivraison;
      if (dto.etapePaiement) pay = dto.etapePaiement;
    } else {
      // Le commentaire « Statut mis à jour vers X » porte le vrai statut Laravel
      // ; sinon on retombe sur le champ `statut` (consolidé ou brut).
      const token = extraireStatutLaravel(dto.commentaire) || dto.statut || null;
      if (token && STATUT_LARAVEL_VERS_LIVRAISON[token]) {
        lv = STATUT_LARAVEL_VERS_LIVRAISON[token];
      } else if (token && STATUT_LARAVEL_VERS_PAIEMENT[token]) {
        pay = STATUT_LARAVEL_VERS_PAIEMENT[token];
      } else if (token) {
        // Jeton inconnu (nouveau statut côté Laravel ?) : on ne corrompt pas les
        // axes, on garde l'état actuel et on trace pour compléter le mapping.
        this.logger.warn(
          `Statut inconnu ignoré (axes inchangés) : colis=${id} token="${token}"`,
        );
      }
    }

    lv = lv || 'en_attente';
    pay = pay || 'ouv';
    const nouveauStatut = deriveStatut(lv, pay);

    // 2) Validation métier de la transition (sauf synchronisation/force).
    const transitionsPossibles = TRANSITIONS_AUTORISEES[ancienStatut] || [];
    if (!isSync && !transitionsPossibles.includes(nouveauStatut)) {
      throw new BadRequestException(
        `Transition invalide : ${ancienStatut} → ${nouveauStatut}. Transitions possibles : ${transitionsPossibles.join(', ') || 'aucune'}`,
      );
    }

    if (!isSync && nouveauStatut === ColisStatut.RETOUR && !dto.retourMotif) {
      throw new BadRequestException(
        'Le motif de retour est obligatoire pour ce statut',
      );
    }

    // 3) Écrit les 2 axes puis le statut dérivé.
    colis.etapeLivraison = lv;
    colis.etapePaiement = pay;
    colis.statut = nouveauStatut;

    const champTimestamp = TIMESTAMP_PAR_STATUT[nouveauStatut];
    if (champTimestamp) {
      (colis as any)[champTimestamp] = new Date();
    }

    if (nouveauStatut === ColisStatut.RETOUR) {
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
        nouveauStatut,
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
