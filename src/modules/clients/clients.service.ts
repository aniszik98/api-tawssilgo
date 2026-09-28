import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

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
    const { page, limit, search } = query;
    const [data, total] = await this.repo.findAndCount({
      where: search
        ? [{ nom: ILike(`%${search}%`) }, { telephone: ILike(`%${search}%`) }]
        : {},
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
