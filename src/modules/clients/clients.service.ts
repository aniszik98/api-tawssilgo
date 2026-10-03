import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, MoreThan, Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { parseSince } from '../../common/utils/parse-since';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  // Le système source (Laravel) pousse le destinataire de chaque colis comme
  // une fiche "client" (nom + téléphone uniquement, sans external_id ni
  // boutique/partenaire/solde). On l'ignore pour ne conserver que les
  // expéditeurs dans `clients`. Désactivable via BLOCK_RECIPIENT_CLIENTS=false.
  private isRecipientPush(dto: CreateClientDto): boolean {
    return (
      !dto.externalId &&
      !dto.boutique &&
      !dto.partenaireId &&
      !dto.email &&
      (dto.solde === undefined || dto.solde === null)
    );
  }

  async create(dto: CreateClientDto, isSync = false) {
    if (this.isRecipientPush(dto) && process.env.BLOCK_RECIPIENT_CLIENTS !== 'false') {
      this.logger.warn(
        `Fiche destinataire ignorée (aucun expéditeur enregistré) : "${dto.nom}" ${dto.telephone || ''}`,
      );
      return { skipped: true, raison: 'destinataire' };
    }

    if (isSync && dto.externalId) {
      const existing = await this.repo.findOne({ where: { externalId: dto.externalId } });
      if (existing) {
        Object.assign(existing, dto);
        return this.repo.save(existing);
      }
    }
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
