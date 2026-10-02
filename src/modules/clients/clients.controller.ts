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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isSyncSource } from '../../common/utils/is-sync-source';

@ApiTags('Clients')
@ApiSecurity('api-key')
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  create(
    @Body() dto: CreateClientDto,
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
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
