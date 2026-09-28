import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborateur } from './collaborateur.entity';
import { CollaborateursService } from './collaborateurs.service';
import { CollaborateursController } from './collaborateurs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Collaborateur])],
  controllers: [CollaborateursController],
  providers: [CollaborateursService],
  exports: [CollaborateursService],
})
export class CollaborateursModule {}
