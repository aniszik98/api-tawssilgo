import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class ChangeStatutColisDto {
  // Statut consolidé OU statut brut de l'intégration Laravel (ex:
  // 'prise_en_charge_livraison', 'en_transit'). L'API dérive les 2 axes
  // (etape_livraison / etape_paiement) puis recalcule `statut`.
  @ApiPropertyOptional({
    description: 'Statut consolidé ou statut brut Laravel',
  })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({ description: 'Axe livraison (prioritaire si fourni)' })
  @IsOptional()
  @IsString()
  etapeLivraison?: string;

  @ApiPropertyOptional({ description: 'Axe paiement (prioritaire si fourni)' })
  @IsOptional()
  @IsString()
  etapePaiement?: string;

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
