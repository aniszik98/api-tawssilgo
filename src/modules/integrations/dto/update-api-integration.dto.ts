import { PartialType } from '@nestjs/swagger';
import { CreateApiIntegrationDto } from './create-api-integration.dto';

export class UpdateApiIntegrationDto extends PartialType(CreateApiIntegrationDto) {}
