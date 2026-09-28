import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appel } from './appel.entity';
import { CreateAppelDto } from './dto/create-appel.dto';

@Injectable()
export class AppelsService {
  constructor(
    @InjectRepository(Appel)
    private readonly repo: Repository<Appel>,
  ) {}

  create(dto: CreateAppelDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findByColis(colisId: string) {
    return this.repo.find({ where: { colisId }, order: { creeLe: 'DESC' } });
  }
}
