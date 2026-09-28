import { PartialType } from '@nestjs/swagger';
import { CreateLivreurDto } from './create-livreur.dto';

export class UpdateLivreurDto extends PartialType(CreateLivreurDto) {}
