import { Module } from '@nestjs/common';
import { AggregationController } from './aggregation.controller';
import { AggregationService } from './aggregation.service';

@Module({
  controllers: [AggregationController],
  providers: [AggregationService],
})
export class AggregationModule {}
