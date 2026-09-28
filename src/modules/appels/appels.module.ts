import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appel } from './appel.entity';
import { AppelsService } from './appels.service';
import { AppelsController } from './appels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appel])],
  controllers: [AppelsController],
  providers: [AppelsService],
})
export class AppelsModule {}
