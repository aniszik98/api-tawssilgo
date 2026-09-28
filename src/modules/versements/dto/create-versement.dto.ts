import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateVersementDto {
  @ApiProperty({ description: "ID du livreur, partenaire ou client selon l'endpoint" })
  @IsUUID()
  beneficiaireId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  montant: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payeParNom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  payeParId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}
