import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Tarif } from './tarif.entity';
import { UpsertTarifDto } from './dto/upsert-tarif.dto';

@Injectable()
export class TarifsService {
  constructor(
    @InjectRepository(Tarif)
    private readonly repo: Repository<Tarif>,
  ) {}

  findAll() {
    return this.repo.find({ order: { num: 'ASC' } });
  }

  async findByWilaya(nom: string): Promise<Tarif> {
    const tarif = await this.repo.findOne({ where: { wilayaNom: ILike(nom) } });
    if (!tarif) throw new NotFoundException(`Aucun tarif trouvé pour la wilaya "${nom}"`);
    return tarif;
  }

  upsert(dto: UpsertTarifDto) {
    return this.repo.save(this.repo.create(dto));
  }
}
