import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ColisStatut } from '../colis.entity';

export class ChangeStatutColisDto {
  @ApiProperty({ enum: ColisStatut })
  @IsEnum(ColisStatut)
  statut: ColisStatut;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiPropertyOptional({ description: 'Requis si statut = retour' })
  @IsOptional()
  @IsString()
  retourMotif?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  livreurId?: string;

  @ApiProperty({ description: 'Nom de la personne qui effectue le changement' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ default: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description:
      'Forcer la transition sans validation métier (usage synchronisation Laravel)',
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
