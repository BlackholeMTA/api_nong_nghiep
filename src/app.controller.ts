import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import type { ApiResponse } from './common/interfaces/api-response.interface';
import { successResponse } from './common/interfaces/api-response.interface';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): ApiResponse<{ message: string }> {
    return successResponse({ message: this.appService.getHello() });
  }
}
