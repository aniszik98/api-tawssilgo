import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  partenaireId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  fromAdmin?: boolean;

  @ApiProperty()
  @IsString()
  contenu: string;
}
