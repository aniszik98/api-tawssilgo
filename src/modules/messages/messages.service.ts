import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  create(dto: CreateMessageDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findConversation(partenaireId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { partenaireId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
