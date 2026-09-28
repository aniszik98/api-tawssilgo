import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColisFlux } from './colis-flux.entity';
import { ColisFluxService } from './colis-flux.service';
import { ColisFluxController } from './colis-flux.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ColisFlux])],
  controllers: [ColisFluxController],
  providers: [ColisFluxService],
})
export class ColisFluxModule {}
