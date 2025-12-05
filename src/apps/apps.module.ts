import { AppsService } from '@/apps/application/services/apps.service';
import { AppsController } from '@/apps/infrastructure/controllers/apps.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
