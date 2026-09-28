import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiIntegration } from './api-integration.entity';
import { ClientApi } from './client-api.entity';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { ColisModule } from '../colis/colis.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApiIntegration, ClientApi]), ColisModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
})
export class IntegrationsModule {}
