import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Navette } from './navette.entity';
import { NavetteHistorique } from './navette-historique.entity';
import { Colis } from '../colis/colis.entity';
import { CreateNavetteDto } from './dto/create-navette.dto';
import { EnvoyerNavetteDto } from './dto/envoyer-navette.dto';
import { NavetteQueryDto } from './dto/navette-query.dto';
import { LaravelSyncService } from '../laravel-sync/laravel-sync.service';
import { parseSince } from '../../common/utils/parse-since';

@Injectable()
export class NavettesService {
  constructor(
    @InjectRepository(Navette)
    private readonly repo: Repository<Navette>,
    @InjectRepository(NavetteHistorique)
    private readonly historiqueRepo: Repository<NavetteHistorique>,
    @InjectRepository(Colis)
    private readonly colisRepo: Repository<Colis>,
    private readonly sync: LaravelSyncService,
  ) {}

  create(dto: CreateNavetteDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: NavetteQueryDto) {
    const { page, limit, statut, updatedSince } = query;
    const where: any = statut ? { statut } : {};
    const since = parseSince(updatedSince);
    if (since) where.updatedAt = MoreThan(since);
    const [data, total] = await this.repo.findAndCount({
      where,
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
  async envoyer(
    id: string,
    dto: EnvoyerNavetteDto,
    isSync = false,
  ): Promise<NavetteHistorique> {
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

    const historique = await this.historiqueRepo.save(
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

    if (!isSync) {
      void this.sync.notifyNavetteStatut(navette);
    }

    return historique;
  }

  async marquerArrivee(id: string, isSync = false): Promise<Navette> {
    const navette = await this.findOne(id);
    navette.statut = 'arrivee';
    const saved = await this.repo.save(navette);
    if (!isSync) {
      void this.sync.notifyNavetteStatut(saved);
    }
    return saved;
  }

  async historique(navetteId: string): Promise<NavetteHistorique[]> {
    await this.findOne(navetteId);
    return this.historiqueRepo.find({
      where: { navetteId },
      order: { createdAt: 'DESC' },
    });
  }
}
