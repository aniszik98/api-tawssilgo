import {
  Body,
  Controller,
  Delete,
  Get,
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

@ApiTags('Livreurs')
@ApiSecurity('api-key')
@Controller('livreurs')
export class LivreursController {
  constructor(private readonly service: LivreursService) {}

  @Post()
  create(@Body() dto: CreateLivreurDto) {
    return this.service.create(dto);
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
  valider(@Param('id') id: string, @Body() dto: ValiderLivreurDto) {
    return this.service.valider(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
