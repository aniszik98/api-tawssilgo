import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageEquipeDto {
  @ApiProperty()
  @IsUUID()
  partenaireId: string;

  @ApiProperty()
  @IsUUID()
  collaborateurId: string;

  @ApiPropertyOptional({ default: 'collaborateur' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty()
  @IsString()
  contenu: string;
}
