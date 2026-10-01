import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ReclamationsService } from './reclamations.service';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { ChangeStatutReclamationDto } from './dto/change-statut-reclamation.dto';
import { ReclamationQueryDto } from './dto/reclamation-query.dto';

@ApiTags('Réclamations')
@ApiSecurity('api-key')
@Controller('reclamations')
export class ReclamationsController {
  constructor(private readonly service: ReclamationsService) {}

  @Post()
  create(@Body() dto: CreateReclamationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ReclamationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/historique')
  historique(@Param('id') id: string) {
    return this.service.historique(id);
  }

  @Post(':id/statut')
  changerStatut(@Param('id') id: string, @Body() dto: ChangeStatutReclamationDto) {
    return this.service.changerStatut(id, dto);
  }
}
