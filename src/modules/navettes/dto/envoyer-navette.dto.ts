import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class EnvoyerNavetteDto {
  @ApiProperty({ type: [String], description: 'IDs des colis à embarquer dans cette navette' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  colisIds: string[];
}
