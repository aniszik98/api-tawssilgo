import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paiement, PaiementStatut } from './paiement.entity';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PartenairesService } from '../partenaires/partenaires.service';

@Injectable()
export class PaiementsService {
  constructor(
    @InjectRepository(Paiement)
    private readonly repo: Repository<Paiement>,
    private readonly partenairesService: PartenairesService,
  ) {}

  create(dto: CreatePaiementDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto & { partenaireId?: string; statut?: string }) {
    const { page, limit, partenaireId, statut } = query;
    const where: any = {};
    if (partenaireId) where.partenaireId = partenaireId;
    if (statut) where.statut = statut;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['colis', 'partenaire'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Paiement> {
    const paiement = await this.repo.findOne({ where: { id }, relations: ['colis', 'partenaire'] });
    if (!paiement) throw new NotFoundException(`Paiement ${id} introuvable`);
    return paiement;
  }

  /**
   * Valide un paiement en attente : passe son statut à "payé" et met à jour
   * le solde du partenaire concerné en conséquence.
   */
  async marquerPaye(id: string): Promise<Paiement> {
    const paiement = await this.findOne(id);
    if (paiement.statut !== PaiementStatut.EN_ATTENTE) {
      throw new BadRequestException(`Ce paiement est déjà au statut "${paiement.statut}"`);
    }
    paiement.statut = PaiementStatut.PAYE;
    await this.repo.save(paiement);

    if (paiement.partenaireId) {
      await this.partenairesService.ajusterSolde(paiement.partenaireId, Number(paiement.montant));
    }
    return paiement;
  }

  async annuler(id: string): Promise<Paiement> {
    const paiement = await this.findOne(id);
    if (paiement.statut !== PaiementStatut.EN_ATTENTE) {
      throw new BadRequestException(`Impossible d'annuler un paiement déjà "${paiement.statut}"`);
    }
    paiement.statut = PaiementStatut.ANNULE;
    return this.repo.save(paiement);
  }
}
