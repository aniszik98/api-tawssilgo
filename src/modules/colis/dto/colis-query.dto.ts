import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

/**
 * Filtres de la liste des colis.
 *
 * Doit heriter de PaginationQueryDto et non utiliser un type d'intersection
 * (`PaginationQueryDto & { ... }`) : TypeScript efface les intersections dans
 * les metadonnees d'emission, Nest recoit alors `Object` comme type, n'instancie
 * pas la classe, les valeurs par defaut (page/limit) disparaissent et la
 * pagination part en erreur.
 */
export class ColisQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer sur un statut de colis' })
  @IsOptional()
  @IsString()
  statut?: string;
}