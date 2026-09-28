import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientVersement,
  LivreurVersement,
  PartenaireVersement,
} from './versement.entities';
import { VersementsService } from './versements.service';
import { VersementsController } from './versements.controller';
import { LivreursModule } from '../livreurs/livreurs.module';
import { PartenairesModule } from '../partenaires/partenaires.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LivreurVersement, PartenaireVersement, ClientVersement]),
    LivreursModule,
    PartenairesModule,
    ClientsModule,
  ],
  controllers: [VersementsController],
  providers: [VersementsService],
})
export class VersementsModule {}
