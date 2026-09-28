import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateColisFluxDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  colisId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codeSuivi?: string;

  @ApiProperty()
  @IsUUID()
  partenaireId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collaborateurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomOperateur?: string;

  @ApiProperty({ enum: ['entrant', 'sortant'] })
  @IsIn(['entrant', 'sortant'])
  sens: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  livreurId?: string;
}
