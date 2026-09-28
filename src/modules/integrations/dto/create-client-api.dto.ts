import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientApiDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ default: 'TawssilGo' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty()
  @IsString()
  urlApi: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({
    example: {
      result_path: 'data',
      map: { code_suivi: 'data.colis.colis_label', destination: 'data.addresse_delivery' },
    },
  })
  @IsObject()
  mapping: { result_path: string; map: Record<string, string> };
}
