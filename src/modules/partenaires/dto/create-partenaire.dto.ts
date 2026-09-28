import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePartenaireDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  magasin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pointCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tarifReception?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tarifLivraison?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
