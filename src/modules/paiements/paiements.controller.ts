import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Paiements')
@ApiSecurity('api-key')
@Controller('paiements')
export class PaiementsController {
  constructor(private readonly service: PaiementsService) {}

  @Post()
  create(@Body() dto: CreatePaiementDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto & { partenaireId?: string; statut?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/payer')
  marquerPaye(@Param('id') id: string) {
    return this.service.marquerPaye(id);
  }

  @Post(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.service.annuler(id);
  }
}
