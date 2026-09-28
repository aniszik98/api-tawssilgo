import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColisFlux } from './colis-flux.entity';
import { CreateColisFluxDto } from './dto/create-colis-flux.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ColisFluxService {
  constructor(
    @InjectRepository(ColisFlux)
    private readonly repo: Repository<ColisFlux>,
  ) {}

  create(dto: CreateColisFluxDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto & { partenaireId?: string; colisId?: string }) {
    const { page, limit, partenaireId, colisId } = query;
    const where: any = {};
    if (partenaireId) where.partenaireId = partenaireId;
    if (colisId) where.colisId = colisId;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { creeLe: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
