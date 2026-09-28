import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarif } from './tarif.entity';
import { TarifsService } from './tarifs.service';
import { TarifsController } from './tarifs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tarif])],
  controllers: [TarifsController],
  providers: [TarifsService],
})
export class TarifsModule {}
