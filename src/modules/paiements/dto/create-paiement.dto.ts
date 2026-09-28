import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePaiementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  colisId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  montant: number;
}
