import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateColisDto {
  @ApiPropertyOptional({ description: 'Généré automatiquement si non fourni' })
  @IsOptional()
  @IsString()
  codeSuivi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireRecepteurId?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinataireNom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinataireTel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinataireAdresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeLivraison?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  poids?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prixLivraison?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prixCommande?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  livraisonGratuite?: boolean;
}
