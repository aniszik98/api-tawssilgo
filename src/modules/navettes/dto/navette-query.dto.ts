import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class NavetteQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer sur un statut de navette' })
  @IsOptional()
  @IsString()
  statut?: string;
}