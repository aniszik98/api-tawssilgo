import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Restreindre a un partenaire' })
  @IsOptional()
  @IsString()
  partenaireId?: string;

  @ApiPropertyOptional({
    description:
      'Restreindre aux notifications internes. Accepte true/false ; converti ' +
      'en booleen car query string, le service teste undefined pour distinguer ' +
      '"aucun filtre" de "filtre desactive".',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  forAdmin?: boolean;
}