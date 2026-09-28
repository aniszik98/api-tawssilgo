import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Colis, ColisStatut } from './colis.entity';
import { ColisHistorique } from './colis-historique.entity';
import { CreateColisDto } from './dto/create-colis.dto';
import { UpdateColisDto } from './dto/update-colis.dto';
import { ChangeStatutColisDto } from './dto/change-statut-colis.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

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
  ) {}

  async create(dto: CreateColisDto): Promise<Colis> {
    const codeSuivi = dto.codeSuivi || this.genererCodeSuivi();
    const colis = this.colisRepo.create({
      ...dto,
      codeSuivi,
      statut: ColisStatut.EN_ATTENTE,
    });
    const saved = await this.colisRepo.save(colis);

    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        colisId: saved.id,
        nouveauStatut: ColisStatut.EN_ATTENTE,
        commentaire: 'Création du colis',
        evenement: 'creation',
      }),
    );
    return saved;
  }

  async findAll(query: PaginationQueryDto & { statut?: string }) {
    const { page, limit, search, statut } = query;
    const where: any = {};
    if (statut) where.statut = statut;
    if (search) where.codeSuivi = ILike(`%${search}%`);

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
  async changerStatut(id: string, dto: ChangeStatutColisDto): Promise<Colis> {
    const colis = await this.findOne(id);
    const transitionsPossibles = TRANSITIONS_AUTORISEES[colis.statut] || [];

    if (!transitionsPossibles.includes(dto.statut)) {
      throw new BadRequestException(
        `Transition invalide : ${colis.statut} → ${dto.statut}. Transitions possibles : ${transitionsPossibles.join(', ') || 'aucune'}`,
      );
    }

    if (dto.statut === ColisStatut.RETOUR && !dto.retourMotif) {
      throw new BadRequestException('Le motif de retour est obligatoire pour ce statut');
    }

    const ancienStatut = colis.statut;
    colis.statut = dto.statut;

    const champTimestamp = TIMESTAMP_PAR_STATUT[dto.statut];
    if (champTimestamp) {
      (colis as any)[champTimestamp] = new Date();
    }

    if (dto.statut === ColisStatut.RETOUR) {
      colis.retourMotif = dto.retourMotif!;
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
