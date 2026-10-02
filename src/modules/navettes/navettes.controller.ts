import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { NavettesService } from './navettes.service';
import { CreateNavetteDto } from './dto/create-navette.dto';
import { EnvoyerNavetteDto } from './dto/envoyer-navette.dto';
import { NavetteQueryDto } from './dto/navette-query.dto';
import { isSyncSource } from '../../common/utils/is-sync-source';

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
  findAll(@Query() query: NavetteQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/envoyer')
  envoyer(
    @Param('id') id: string,
    @Body() dto: EnvoyerNavetteDto,
    @Headers('x-sync-source') syncSource?: string,
  ) {
    return this.service.envoyer(id, dto, isSyncSource(syncSource));
  }

  @Post(':id/arrivee')
  marquerArrivee(
    @Param('id') id: string,
    @Headers('x-sync-source') syncSource?: string,
  ) {
    return this.service.marquerArrivee(id, isSyncSource(syncSource));
  }

  @Get(':id/historique')
  historique(@Param('id') id: string) {
    return this.service.historique(id);
  }
}
