import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReclamationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  colisId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codeSuivi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientNom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientTel?: string;

  @ApiProperty({ default: 'autre' })
  @IsString()
  motif: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
