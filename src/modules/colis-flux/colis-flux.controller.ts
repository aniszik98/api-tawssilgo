import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ColisFluxService } from './colis-flux.service';
import { CreateColisFluxDto } from './dto/create-colis-flux.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Colis - Flux physique')
@ApiSecurity('api-key')
@Controller('colis-flux')
export class ColisFluxController {
  constructor(private readonly service: ColisFluxService) {}

  @Post()
  create(@Body() dto: CreateColisFluxDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto & { partenaireId?: string; colisId?: string }) {
    return this.service.findAll(query);
  }
}
