import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ColisFluxQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Restreindre a un partenaire' })
  @IsOptional()
  @IsString()
  partenaireId?: string;

  @ApiPropertyOptional({ description: "Restreindre aux mouvements d'un colis" })
  @IsOptional()
  @IsString()
  colisId?: string;
}