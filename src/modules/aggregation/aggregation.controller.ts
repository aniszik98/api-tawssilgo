import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { AggregationService } from './aggregation.service';

// Sécurité : on n'interroge jamais une table arbitraire envoyée dans l'URL.
// Ajoute ici les autres tables à agréger si besoin (ex: 'partenaires').
const ALLOWED_TABLES = ['colis', 'partenaires'];

@Controller('aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get(':table')
  async getMerged(
    @Param('table') table: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    if (!ALLOWED_TABLES.includes(table)) {
      throw new BadRequestException(
        `Table "${table}" non supportée pour l'agrégation. Tables disponibles : ${ALLOWED_TABLES.join(', ')}`,
      );
    }

    return this.aggregationService.getMerged(
      table,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }
}
