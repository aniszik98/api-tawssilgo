import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './common/guards/api-key.guard';

import { HealthModule } from './modules/health/health.module';
import { PartenairesModule } from './modules/partenaires/partenaires.module';
import { LivreursModule } from './modules/livreurs/livreurs.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ColisModule } from './modules/colis/colis.module';
import { PaiementsModule } from './modules/paiements/paiements.module';
import { ReclamationsModule } from './modules/reclamations/reclamations.module';
import { CollaborateursModule } from './modules/collaborateurs/collaborateurs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NavettesModule } from './modules/navettes/navettes.module';
import { AppelsModule } from './modules/appels/appels.module';
import { ColisFluxModule } from './modules/colis-flux/colis-flux.module';
import { TarifsModule } from './modules/tarifs/tarifs.module';
import { VersementsModule } from './modules/versements/versements.module';
import { MessagerieModule } from './modules/messagerie/messagerie.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { LaravelSyncModule } from './modules/laravel-sync/laravel-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    HealthModule,
    PartenairesModule,
    LivreursModule,
    ClientsModule,
    ColisModule,
    PaiementsModule,
    ReclamationsModule,
    CollaborateursModule,
    NotificationsModule,
    MessagesModule,
    NavettesModule,
    AppelsModule,
    ColisFluxModule,
    TarifsModule,
    VersementsModule,
    MessagerieModule,
    IntegrationsModule,
    LaravelSyncModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
