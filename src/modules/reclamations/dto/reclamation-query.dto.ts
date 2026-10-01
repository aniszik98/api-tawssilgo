import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ReclamationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer sur un statut de reclamation' })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({ description: 'Restreindre a un partenaire' })
  @IsOptional()
  @IsString()
  partenaireId?: string;
}