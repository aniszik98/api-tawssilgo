import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ColisStatut } from '../colis.entity';

export class CreateColisDto {
  @ApiPropertyOptional({ description: 'Généré automatiquement si non fourni' })
  @IsOptional()
  @IsString()
  codeSuivi?: string;

  @ApiPropertyOptional({ description: 'Identifiant dans le système source (Laravel)' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({
    enum: ColisStatut,
    description: 'Utilisé uniquement en mode synchronisation',
  })
  @IsOptional()
  @IsEnum(ColisStatut)
  statut?: ColisStatut;

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
