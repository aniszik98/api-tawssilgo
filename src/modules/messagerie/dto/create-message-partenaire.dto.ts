import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateMessagePartenaireDto {
  @ApiProperty()
  @IsUUID()
  expediteurId: string;

  @ApiProperty()
  @IsUUID()
  destinataireId: string;

  @ApiProperty()
  @IsString()
  contenu: string;
}
