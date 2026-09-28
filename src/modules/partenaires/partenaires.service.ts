import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Partenaire } from './partenaire.entity';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class PartenairesService {
  constructor(
    @InjectRepository(Partenaire)
    private readonly repo: Repository<Partenaire>,
  ) {}

  async create(dto: CreatePartenaireDto): Promise<Partenaire> {
    const partenaire = this.repo.create(dto);
    return this.repo.save(partenaire);
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const [data, total] = await this.repo.findAndCount({
      where: search ? [{ nom: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }] : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Partenaire> {
    const partenaire = await this.repo.findOne({ where: { id } });
    if (!partenaire) throw new NotFoundException(`Partenaire ${id} introuvable`);
    return partenaire;
  }

  async update(id: string, dto: UpdatePartenaireDto): Promise<Partenaire> {
    const partenaire = await this.findOne(id);
    Object.assign(partenaire, dto);
    return this.repo.save(partenaire);
  }

  async remove(id: string): Promise<void> {
    const partenaire = await this.findOne(id);
    // Désactivation logique plutôt que suppression physique, pour préserver
    // l'historique des colis / paiements liés.
    partenaire.actif = false;
    await this.repo.save(partenaire);
  }

  /** Ajuste le solde du partenaire (utilisé par le module Paiements). */
  async ajusterSolde(id: string, montant: number): Promise<Partenaire> {
    const partenaire = await this.findOne(id);
    partenaire.solde = Number(partenaire.solde) + montant;
    return this.repo.save(partenaire);
  }
}
