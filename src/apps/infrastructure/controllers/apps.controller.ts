import { AppsService } from '@/apps/application/services/apps.service';
import { Controller } from '@nestjs/common';

@Controller('api/v1/apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}
}
