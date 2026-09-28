import { PartialType } from '@nestjs/swagger';
import { CreateCollaborateurDto } from './create-collaborateur.dto';

export class UpdateCollaborateurDto extends PartialType(CreateCollaborateurDto) {}
