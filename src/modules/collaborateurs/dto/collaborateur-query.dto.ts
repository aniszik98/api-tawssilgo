import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class CollaborateurQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Restreindre a un partenaire' })
  @IsOptional()
  @IsString()
  partenaireId?: string;
}