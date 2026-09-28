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
import { IntegrationsService } from './integrations.service';
import { CreateApiIntegrationDto } from './dto/create-api-integration.dto';
import { UpdateApiIntegrationDto } from './dto/update-api-integration.dto';
import { CreateClientApiDto } from './dto/create-client-api.dto';

@ApiTags('Intégrations API externes')
@ApiSecurity('api-key')
@Controller()
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  // --- Intégrations partenaires ---

  @Post('api-integrations')
  create(@Body() dto: CreateApiIntegrationDto) {
    return this.service.create(dto);
  }

  @Get('api-integrations')
  findAll() {
    return this.service.findAll();
  }

  @Get('api-integrations/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('api-integrations/:id')
  update(@Param('id') id: string, @Body() dto: UpdateApiIntegrationDto) {
    return this.service.update(id, dto);
  }

  @Delete('api-integrations/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('api-integrations/:id/sync')
  sync(@Param('id') id: string) {
    return this.service.syncApiIntegration(id);
  }

  // --- Intégrations clients ---

  @Post('client-apis')
  createClientApi(@Body() dto: CreateClientApiDto) {
    return this.service.createClientApi(dto);
  }

  @Get('client-apis')
  findAllClientApis(@Query('clientId') clientId?: string) {
    return this.service.findAllClientApis(clientId);
  }

  @Get('client-apis/:id')
  findOneClientApi(@Param('id') id: string) {
    return this.service.findOneClientApi(id);
  }

  @Post('client-apis/:id/sync')
  syncClientApi(@Param('id') id: string) {
    return this.service.syncClientApi(id);
  }
}
