import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateChatReseauDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collaborateurId?: string;

  @ApiPropertyOptional({ default: 'partenaire' })
  @IsOptional()
  @IsString()
  expediteurRole?: string;

  @ApiProperty()
  @IsString()
  expediteurNom: string;

  @ApiProperty()
  @IsString()
  contenu: string;
}
