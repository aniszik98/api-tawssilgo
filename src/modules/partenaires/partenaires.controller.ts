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
import { PartenairesService } from './partenaires.service';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Partenaires')
@ApiSecurity('api-key')
@Controller('partenaires')
export class PartenairesController {
  constructor(private readonly service: PartenairesService) {}

  @Post()
  create(@Body() dto: CreatePartenaireDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdatePartenaireDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
