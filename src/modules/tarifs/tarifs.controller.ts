import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TarifsService } from './tarifs.service';
import { UpsertTarifDto } from './dto/upsert-tarif.dto';

@ApiTags('Tarifs')
@ApiSecurity('api-key')
@Controller('tarifs')
export class TarifsController {
  constructor(private readonly service: TarifsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('wilaya/:nom')
  findByWilaya(@Param('nom') nom: string) {
    return this.service.findByWilaya(nom);
  }

  @Put()
  upsert(@Body() dto: UpsertTarifDto) {
    return this.service.upsert(dto);
  }
}
