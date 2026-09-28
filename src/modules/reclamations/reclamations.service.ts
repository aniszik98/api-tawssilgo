import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reclamation, ReclamationStatut } from './reclamation.entity';
import { ReclamationHistorique } from './reclamation-historique.entity';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { ChangeStatutReclamationDto } from './dto/change-statut-reclamation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ReclamationsService {
  constructor(
    @InjectRepository(Reclamation)
    private readonly repo: Repository<Reclamation>,
    @InjectRepository(ReclamationHistorique)
    private readonly historiqueRepo: Repository<ReclamationHistorique>,
  ) {}

  private genererNumero(): string {
    return `REC-${Date.now().toString(36).toUpperCase()}`;
  }

  async create(dto: CreateReclamationDto): Promise<Reclamation> {
    const reclamation = this.repo.create({
      ...dto,
      numero: this.genererNumero(),
      statut: ReclamationStatut.EN_ATTENTE,
    });
    const saved = await this.repo.save(reclamation);

    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        reclamationId: saved.id,
        nouveauStatut: ReclamationStatut.EN_ATTENTE,
        commentaire: 'Réclamation créée',
      }),
    );
    return saved;
  }

  async findAll(query: PaginationQueryDto & { statut?: string; partenaireId?: string }) {
    const { page, limit, statut, partenaireId } = query;
    const where: any = {};
    if (statut) where.statut = statut;
    if (partenaireId) where.partenaireId = partenaireId;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['colis', 'client', 'partenaire', 'livreur'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Reclamation> {
    const reclamation = await this.repo.findOne({
      where: { id },
      relations: ['colis', 'client', 'partenaire', 'livreur'],
    });
    if (!reclamation) throw new NotFoundException(`Réclamation ${id} introuvable`);
    return reclamation;
  }

  /** Change le statut d'une réclamation en conservant une trace dans l'historique. */
  async changerStatut(id: string, dto: ChangeStatutReclamationDto): Promise<Reclamation> {
    const reclamation = await this.findOne(id);
    const ancienStatut = reclamation.statut;

    reclamation.statut = dto.statut;
    if (dto.reponse) reclamation.reponse = dto.reponse;
    if (dto.actionsEffectuees) reclamation.actionsEffectuees = dto.actionsEffectuees;
    if (dto.statut === ReclamationStatut.TRAITEE) {
      reclamation.traitePar = dto.nom;
      reclamation.traiteLe = new Date();
    }

    await this.repo.save(reclamation);

    await this.historiqueRepo.save(
      this.historiqueRepo.create({
        reclamationId: reclamation.id,
        role: dto.role || 'admin',
        nom: dto.nom,
        ancienStatut,
        nouveauStatut: dto.statut,
        commentaire: dto.commentaire || '',
      }),
    );

    return reclamation;
  }

  async historique(reclamationId: string): Promise<ReclamationHistorique[]> {
    await this.findOne(reclamationId);
    return this.historiqueRepo.find({
      where: { reclamationId },
      order: { createdAt: 'ASC' },
    });
  }
}
