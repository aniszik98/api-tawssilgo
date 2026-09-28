import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colis } from './colis.entity';
import { ColisHistorique } from './colis-historique.entity';
import { ColisService } from './colis.service';
import { ColisController } from './colis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Colis, ColisHistorique])],
  controllers: [ColisController],
  providers: [ColisService],
  exports: [ColisService],
})
export class ColisModule {}
