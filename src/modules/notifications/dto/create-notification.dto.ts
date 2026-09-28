import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  forAdmin?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaireId?: string;

  @ApiPropertyOptional({ default: 'info' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsString()
  contenu: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lien?: string;
}
