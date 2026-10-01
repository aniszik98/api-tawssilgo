import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ColisService } from './colis.service';
import { CreateColisDto } from './dto/create-colis.dto';
import { UpdateColisDto } from './dto/update-colis.dto';
import { ChangeStatutColisDto } from './dto/change-statut-colis.dto';
import { ColisQueryDto } from './dto/colis-query.dto';

@ApiTags('Colis')
@ApiSecurity('api-key')
@Controller('colis')
export class ColisController {
  constructor(private readonly service: ColisService) {}

  @Post()
  create(@Body() dto: CreateColisDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ColisQueryDto) {
    return this.service.findAll(query);
  }

  @Get('suivi/:codeSuivi')
  findByCodeSuivi(@Param('codeSuivi') codeSuivi: string) {
    return this.service.findByCodeSuivi(codeSuivi);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/historique')
  historique(@Param('id') id: string) {
    return this.service.historique(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateColisDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/statut')
  changerStatut(@Param('id') id: string, @Body() dto: ChangeStatutColisDto) {
    return this.service.changerStatut(id, dto);
  }
}
