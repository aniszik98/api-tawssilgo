import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, MoreThan, Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { parseSince } from '../../common/utils/parse-since';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  create(dto: CreateClientDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search, updatedSince } = query;
    const base: any = {};
    const since = parseSince(updatedSince);
    if (since) base.updatedAt = MoreThan(since);
    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [
            { ...base, nom: ILike(`%${search}%`) },
            { ...base, telephone: ILike(`%${search}%`) },
          ]
        : base,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} introuvable`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.repo.save(client);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async ajusterSolde(id: string, montant: number): Promise<Client> {
    const client = await this.findOne(id);
    client.solde = Number(client.solde) + montant;
    return this.repo.save(client);
  }
}
