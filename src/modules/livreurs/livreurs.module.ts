import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livreur } from './livreur.entity';
import { LivreursService } from './livreurs.service';
import { LivreursController } from './livreurs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Livreur])],
  controllers: [LivreursController],
  providers: [LivreursService],
  exports: [LivreursService],
})
export class LivreursModule {}
