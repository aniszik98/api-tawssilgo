import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClientVersement,
  LivreurVersement,
  PartenaireVersement,
} from './versement.entities';
import { CreateVersementDto } from './dto/create-versement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { LivreursService } from '../livreurs/livreurs.service';
import { PartenairesService } from '../partenaires/partenaires.service';
import { ClientsService } from '../clients/clients.service';

/**
 * Un "versement" correspond à un paiement effectué par l'entreprise vers un
 * livreur / partenaire / client pour solder (tout ou partie) le montant qui
 * lui est dû. Chaque versement décrémente donc automatiquement le solde
 * correspondant.
 */
@Injectable()
export class VersementsService {
  constructor(
    @InjectRepository(LivreurVersement)
    private readonly livreurRepo: Repository<LivreurVersement>,
    @InjectRepository(PartenaireVersement)
    private readonly partenaireRepo: Repository<PartenaireVersement>,
    @InjectRepository(ClientVersement)
    private readonly clientRepo: Repository<ClientVersement>,
    private readonly livreursService: LivreursService,
    private readonly partenairesService: PartenairesService,
    private readonly clientsService: ClientsService,
  ) {}

  async verserLivreur(dto: CreateVersementDto) {
    const versement = await this.livreurRepo.save(
      this.livreurRepo.create({
        livreurId: dto.beneficiaireId,
        montant: dto.montant,
        payeParNom: dto.payeParNom,
        payeParId: dto.payeParId,
        commentaire: dto.commentaire || '',
      }),
    );
    await this.livreursService.ajusterSolde(dto.beneficiaireId, -Math.abs(dto.montant));
    return versement;
  }

  listVersementsLivreur(livreurId: string, query: PaginationQueryDto) {
    return this.paginer(this.livreurRepo, { livreurId }, query);
  }

  async verserPartenaire(dto: CreateVersementDto) {
    const versement = await this.partenaireRepo.save(
      this.partenaireRepo.create({
        partenaireId: dto.beneficiaireId,
        montant: dto.montant,
        payeParNom: dto.payeParNom,
        payeParId: dto.payeParId,
        commentaire: dto.commentaire || '',
      }),
    );
    await this.partenairesService.ajusterSolde(dto.beneficiaireId, -Math.abs(dto.montant));
    return versement;
  }

  listVersementsPartenaire(partenaireId: string, query: PaginationQueryDto) {
    return this.paginer(this.partenaireRepo, { partenaireId }, query);
  }

  async verserClient(dto: CreateVersementDto) {
    const versement = await this.clientRepo.save(
      this.clientRepo.create({
        clientId: dto.beneficiaireId,
        montant: dto.montant,
        payeParNom: dto.payeParNom,
        payeParId: dto.payeParId,
      }),
    );
    await this.clientsService.ajusterSolde(dto.beneficiaireId, -Math.abs(dto.montant));
    return versement;
  }

  listVersementsClient(clientId: string, query: PaginationQueryDto) {
    return this.paginer(this.clientRepo, { clientId }, query);
  }

  private async paginer(repo: Repository<any>, where: any, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [data, total] = await repo.findAndCount({
      where,
      order: { versementLe: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
