import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpsertTarifDto {
  @ApiProperty()
  @IsInt()
  num: number;

  @ApiProperty()
  @IsString()
  wilayaNom: string;

  @ApiProperty()
  @IsString()
  norm: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  encD?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  encS?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  convD?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  convS?: number;
}
