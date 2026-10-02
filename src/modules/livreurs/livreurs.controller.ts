import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LivreursService } from './livreurs.service';
import { CreateLivreurDto } from './dto/create-livreur.dto';
import { UpdateLivreurDto } from './dto/update-livreur.dto';
import { ValiderLivreurDto } from './dto/valider-livreur.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isSyncSource } from '../../common/utils/is-sync-source';

@ApiTags('Livreurs')
@ApiSecurity('api-key')
@Controller('livreurs')
export class LivreursController {
  constructor(private readonly service: LivreursService) {}

  @Post()
  create(
    @Body() dto: CreateLivreurDto,
    @Headers('x-sync-source') syncSource?: string,
  ) {
    return this.service.create(dto, isSyncSource(syncSource));
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLivreurDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/validation')
  valider(
    @Param('id') id: string,
    @Body() dto: ValiderLivreurDto,
    @Headers('x-sync-source') syncSource?: string,
  ) {
    return this.service.valider(id, dto, isSyncSource(syncSource));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
