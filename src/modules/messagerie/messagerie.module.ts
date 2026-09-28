import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatReseau, MessageEquipe, MessagePartenaire } from './messagerie.entities';
import { MessagerieService } from './messagerie.service';
import { MessagerieController } from './messagerie.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatReseau, MessagePartenaire, MessageEquipe])],
  controllers: [MessagerieController],
  providers: [MessagerieService],
})
export class MessagerieModule {}
