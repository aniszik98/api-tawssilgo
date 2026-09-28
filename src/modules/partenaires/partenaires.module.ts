import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partenaire } from './partenaire.entity';
import { PartenairesService } from './partenaires.service';
import { PartenairesController } from './partenaires.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Partenaire])],
  controllers: [PartenairesController],
  providers: [PartenairesService],
  exports: [PartenairesService],
})
export class PartenairesModule {}
