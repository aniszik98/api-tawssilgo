import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VersementsService } from './versements.service';
import { CreateVersementDto } from './dto/create-versement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Versements')
@ApiSecurity('api-key')
@Controller('versements')
export class VersementsController {
  constructor(private readonly service: VersementsService) {}

  @Post('livreurs')
  verserLivreur(@Body() dto: CreateVersementDto) {
    return this.service.verserLivreur(dto);
  }

  @Get('livreurs/:livreurId')
  listVersementsLivreur(@Param('livreurId') livreurId: string, @Query() query: PaginationQueryDto) {
    return this.service.listVersementsLivreur(livreurId, query);
  }

  @Post('partenaires')
  verserPartenaire(@Body() dto: CreateVersementDto) {
    return this.service.verserPartenaire(dto);
  }

  @Get('partenaires/:partenaireId')
  listVersementsPartenaire(
    @Param('partenaireId') partenaireId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listVersementsPartenaire(partenaireId, query);
  }

  @Post('clients')
  verserClient(@Body() dto: CreateVersementDto) {
    return this.service.verserClient(dto);
  }

  @Get('clients/:clientId')
  listVersementsClient(@Param('clientId') clientId: string, @Query() query: PaginationQueryDto) {
    return this.service.listVersementsClient(clientId, query);
  }
}
