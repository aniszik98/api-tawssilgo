import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(dto: CreateNotificationDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto & { partenaireId?: string; forAdmin?: boolean }) {
    const { page, limit, partenaireId, forAdmin } = query;
    const where: any = {};
    if (partenaireId) where.partenaireId = partenaireId;
    if (forAdmin !== undefined) where.forAdmin = forAdmin;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async marquerLue(id: string): Promise<Notification> {
    const notif = await this.repo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException(`Notification ${id} introuvable`);
    notif.lu = true;
    return this.repo.save(notif);
  }
}
