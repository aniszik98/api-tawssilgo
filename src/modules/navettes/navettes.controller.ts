import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { NavettesService } from './navettes.service';
import { CreateNavetteDto } from './dto/create-navette.dto';
import { EnvoyerNavetteDto } from './dto/envoyer-navette.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Navettes')
@ApiSecurity('api-key')
@Controller('navettes')
export class NavettesController {
  constructor(private readonly service: NavettesService) {}

  @Post()
  create(@Body() dto: CreateNavetteDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto & { statut?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/envoyer')
  envoyer(@Param('id') id: string, @Body() dto: EnvoyerNavetteDto) {
    return this.service.envoyer(id, dto);
  }

  @Post(':id/arrivee')
  marquerArrivee(@Param('id') id: string) {
    return this.service.marquerArrivee(id);
  }

  @Get(':id/historique')
  historique(@Param('id') id: string) {
    return this.service.historique(id);
  }
}
