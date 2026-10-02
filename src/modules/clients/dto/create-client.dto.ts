import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientDto {
  @ApiPropertyOptional({ description: 'Identifiant dans le système source (Laravel)' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty()
  @IsString()
  nom: string;

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
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  boutique?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;
}
