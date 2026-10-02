import { Global, Module } from '@nestjs/common';
import { LaravelSyncService } from './laravel-sync.service';

@Global()
@Module({
  providers: [LaravelSyncService],
  exports: [LaravelSyncService],
})
export class LaravelSyncModule {}
