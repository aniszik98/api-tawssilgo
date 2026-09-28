import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Navette } from './navette.entity';
import { NavetteHistorique } from './navette-historique.entity';
import { Colis } from '../colis/colis.entity';
import { NavettesService } from './navettes.service';
import { NavettesController } from './navettes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Navette, NavetteHistorique, Colis])],
  controllers: [NavettesController],
  providers: [NavettesService],
})
export class NavettesModule {}
