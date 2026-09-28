import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppelDto {
  @ApiProperty()
  @IsUUID()
  colisId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  livreurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tel?: string;

  @ApiProperty({ enum: ['sortant', 'entrant', 'note'] })
  @IsIn(['sortant', 'entrant', 'note'])
  sens: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  dureeSeconde?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
