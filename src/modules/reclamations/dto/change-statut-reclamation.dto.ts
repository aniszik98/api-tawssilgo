import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReclamationStatut } from '../reclamation.entity';

export class ChangeStatutReclamationDto {
  @ApiProperty({ enum: ReclamationStatut })
  @IsEnum(ReclamationStatut)
  statut: ReclamationStatut;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reponse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionsEffectuees?: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional({ default: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}
