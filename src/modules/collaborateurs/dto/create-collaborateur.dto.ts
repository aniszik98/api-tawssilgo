import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCollaborateurDto {
  @ApiProperty()
  @IsUUID()
  partenaireId: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Liste des permissions/tâches assignées' })
  @IsOptional()
  @IsObject()
  taches?: Record<string, any>;
}
