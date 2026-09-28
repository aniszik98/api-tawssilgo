import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborateur } from './collaborateur.entity';
import { CreateCollaborateurDto } from './dto/create-collaborateur.dto';
import { UpdateCollaborateurDto } from './dto/update-collaborateur.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class CollaborateursService {
  constructor(
    @InjectRepository(Collaborateur)
    private readonly repo: Repository<Collaborateur>,
  ) {}

  create(dto: CreateCollaborateurDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto & { partenaireId?: string }) {
    const { page, limit, partenaireId } = query;
    const [data, total] = await this.repo.findAndCount({
      where: partenaireId ? { partenaireId } : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Collaborateur> {
    const collaborateur = await this.repo.findOne({ where: { id } });
    if (!collaborateur) throw new NotFoundException(`Collaborateur ${id} introuvable`);
    return collaborateur;
  }

  async update(id: string, dto: UpdateCollaborateurDto): Promise<Collaborateur> {
    const collaborateur = await this.findOne(id);
    Object.assign(collaborateur, dto);
    return this.repo.save(collaborateur);
  }

  async remove(id: string): Promise<void> {
    const collaborateur = await this.findOne(id);
    collaborateur.actif = false;
    await this.repo.save(collaborateur);
  }
}
