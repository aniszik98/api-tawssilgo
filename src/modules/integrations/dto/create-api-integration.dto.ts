import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateApiIntegrationDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty({ description: "URL de l'API externe à interroger" })
  @IsString()
  urlApi: string;

  @ApiPropertyOptional({ enum: ['GET', 'POST'], default: 'GET' })
  @IsOptional()
  @IsIn(['GET', 'POST'])
  methode?: string;

  @ApiPropertyOptional({ description: "Clé d'authentification envoyée en Bearer token" })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;

  @ApiProperty({
    description:
      'Chemin vers le tableau de résultats + correspondance champ local -> chemin distant',
    example: {
      result_path: 'commandes',
      map: { destination: 'destination', client_nom: 'client_nom', code_suivi: 'code_suivi' },
    },
  })
  @IsObject()
  mapping: { result_path: string; map: Record<string, string> };
}
