import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLivreurDto {
  @ApiPropertyOptional({ description: 'Identifiant dans le système source (Laravel)' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Utilisé uniquement en mode synchronisation' })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeVehicule?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permisPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carteGrisePhotoUrl?: string;

  @ApiPropertyOptional({ description: 'Utilisé uniquement en mode synchronisation' })
  @IsOptional()
  @IsNumber()
  solde?: number;

  @ApiPropertyOptional({ description: 'Utilisé uniquement en mode synchronisation' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
