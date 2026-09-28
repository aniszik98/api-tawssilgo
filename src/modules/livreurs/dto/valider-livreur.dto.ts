import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ValiderLivreurDto {
  @ApiProperty({ enum: ['valider', 'refuser'] })
  @IsIn(['valider', 'refuser'])
  decision: 'valider' | 'refuser';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raison?: string;

  @ApiProperty({ description: "Nom de la personne qui valide" })
  @IsString()
  validePar: string;

  @ApiPropertyOptional({ default: 'admin' })
  @IsOptional()
  @IsString()
  valideRole?: string;
}
