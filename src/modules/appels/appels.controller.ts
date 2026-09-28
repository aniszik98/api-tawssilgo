import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AppelsService } from './appels.service';
import { CreateAppelDto } from './dto/create-appel.dto';

@ApiTags('Appels')
@ApiSecurity('api-key')
@Controller('appels')
export class AppelsController {
  constructor(private readonly service: AppelsService) {}

  @Post()
  create(@Body() dto: CreateAppelDto) {
    return this.service.create(dto);
  }

  @Get('colis/:colisId')
  findByColis(@Param('colisId') colisId: string) {
    return this.service.findByColis(colisId);
  }
}
