import { PartialType } from '@nestjs/swagger';
import { CreateColisDto } from './create-colis.dto';

export class UpdateColisDto extends PartialType(CreateColisDto) {}
