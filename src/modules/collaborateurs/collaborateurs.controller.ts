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
import { CollaborateursService } from './collaborateurs.service';
import { CreateCollaborateurDto } from './dto/create-collaborateur.dto';
import { UpdateCollaborateurDto } from './dto/update-collaborateur.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Collaborateurs')
@ApiSecurity('api-key')
@Controller('collaborateurs')
export class CollaborateursController {
  constructor(private readonly service: CollaborateursService) {}

  @Post()
  create(@Body() dto: CreateCollaborateurDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto & { partenaireId?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollaborateurDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
