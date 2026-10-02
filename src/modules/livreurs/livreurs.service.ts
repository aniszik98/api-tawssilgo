import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, MoreThan, Repository } from 'typeorm';
import { Livreur } from './livreur.entity';
import { CreateLivreurDto } from './dto/create-livreur.dto';
import { UpdateLivreurDto } from './dto/update-livreur.dto';
import { ValiderLivreurDto } from './dto/valider-livreur.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { LaravelSyncService } from '../laravel-sync/laravel-sync.service';
import { parseSince } from '../../common/utils/parse-since';

@Injectable()
export class LivreursService {
  constructor(
    @InjectRepository(Livreur)
    private readonly repo: Repository<Livreur>,
    private readonly sync: LaravelSyncService,
  ) {}

  async create(dto: CreateLivreurDto, isSync = false) {
    if (isSync && dto.externalId) {
      const existing = await this.repo.findOne({ where: { externalId: dto.externalId } });
      if (existing) {
        const { statut, ...rest } = dto;
        Object.assign(existing, rest);
        if (statut) existing.statut = statut;
        return this.repo.save(existing);
      }
    }
    const statut = isSync && dto.statut ? dto.statut : 'en_attente_validation';
    const livreur = this.repo.create({ ...dto, statut });
    return this.repo.save(livreur);
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search, updatedSince } = query;
    const where: any = search ? { nom: ILike(`%${search}%`) } : {};
    const since = parseSince(updatedSince);
    if (since) where.updatedAt = MoreThan(since);
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['partenaire'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Livreur> {
    const livreur = await this.repo.findOne({ where: { id }, relations: ['partenaire'] });
    if (!livreur) throw new NotFoundException(`Livreur ${id} introuvable`);
    return livreur;
  }

  async update(id: string, dto: UpdateLivreurDto): Promise<Livreur> {
    const livreur = await this.findOne(id);
    Object.assign(livreur, dto);
    return this.repo.save(livreur);
  }

  /** Logique métier : validation ou refus d'un livreur par un partenaire/admin. */
  async valider(
    id: string,
    dto: ValiderLivreurDto,
    isSync = false,
  ): Promise<Livreur> {
    const livreur = await this.findOne(id);
    if (dto.decision === 'valider') {
      livreur.statut = 'actif';
      livreur.actif = true;
      livreur.refuseRaison = '';
    } else {
      livreur.statut = 'refuse';
      livreur.actif = false;
      livreur.refuseRaison = dto.raison || '';
    }
    livreur.validePar = dto.validePar;
    livreur.valideRole = dto.valideRole || 'admin';
    livreur.valideLe = new Date();
    const saved = await this.repo.save(livreur);
    if (!isSync) {
      void this.sync.notifyLivreurValidation(saved);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const livreur = await this.findOne(id);
    livreur.actif = false;
    livreur.statut = 'suspendu';
    await this.repo.save(livreur);
  }

  async ajusterSolde(id: string, montant: number): Promise<Livreur> {
    const livreur = await this.findOne(id);
    livreur.solde = Number(livreur.solde) + montant;
    return this.repo.save(livreur);
  }
}
