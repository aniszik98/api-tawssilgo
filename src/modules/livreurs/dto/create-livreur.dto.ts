import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLivreurDto {
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
}
