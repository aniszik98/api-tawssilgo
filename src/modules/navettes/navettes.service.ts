import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Navette } from './navette.entity';
import { NavetteHistorique } from './navette-historique.entity';
import { Colis } from '../colis/colis.entity';
import { CreateNavetteDto } from './dto/create-navette.dto';
import { EnvoyerNavetteDto } from './dto/envoyer-navette.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class NavettesService {
  constructor(
    @InjectRepository(Navette)
    private readonly repo: Repository<Navette>,
    @InjectRepository(NavetteHistorique)
    private readonly historiqueRepo: Repository<NavetteHistorique>,
    @InjectRepository(Colis)
    private readonly colisRepo: Repository<Colis>,
  ) {}

  create(dto: CreateNavetteDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto & { statut?: string }) {
    const { page, limit, statut } = query;
    const [data, total] = await this.repo.findAndCount({
      where: statut ? { statut } : {},
      relations: ['conducteur'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Navette> {
    const navette = await this.repo.findOne({ where: { id }, relations: ['conducteur'] });
    if (!navette) throw new NotFoundException(`Navette ${id} introuvable`);
    return navette;
  }

  /**
   * Embarque une liste de colis dans la navette : rattache chaque colis à la
   * navette, marque la navette "en_route", et crée une ligne d'historique
   * conservant la liste exacte des colis envoyés à cet instant.
   */
  async envoyer(id: string, dto: EnvoyerNavetteDto): Promise<NavetteHistorique> {
    const navette = await this.findOne(id);

    const colisTrouves = await this.colisRepo.find({ where: { id: In(dto.colisIds) } });
    if (colisTrouves.length !== dto.colisIds.length) {
      throw new NotFoundException('Un ou plusieurs colis fournis sont introuvables');
    }

    await this.colisRepo
      .createQueryBuilder()
      .update(Colis)
      .set({ navetteId: navette.id })
      .whereInIds(dto.colisIds)
      .execute();

    navette.statut = 'en_route';
    navette.sentAt = new Date();
    await this.repo.save(navette);

    return this.historiqueRepo.save(
      this.historiqueRepo.create({
        navetteId: navette.id,
        nom: navette.nom,
        action: 'envoi',
        depart: navette.depart,
        arrivee: navette.arrivee,
        wilayas: navette.wilayas,
        colisIds: dto.colisIds,
        sentAt: navette.sentAt,
        conducteurId: navette.conducteurId,
      }),
    );
  }

  async marquerArrivee(id: string): Promise<Navette> {
    const navette = await this.findOne(id);
    navette.statut = 'arrivee';
    return this.repo.save(navette);
  }

  async historique(navetteId: string): Promise<NavetteHistorique[]> {
    await this.findOne(navetteId);
    return this.historiqueRepo.find({
      where: { navetteId },
      order: { createdAt: 'DESC' },
    });
  }
}
