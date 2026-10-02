import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNavetteDto {
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

  @ApiProperty()
  @IsString()
  depart: string;

  @ApiProperty()
  @IsString()
  arrivee: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  wilayas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  capacite?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  conducteurId?: string;
}
