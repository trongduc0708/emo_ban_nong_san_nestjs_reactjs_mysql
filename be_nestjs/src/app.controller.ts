import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Public API để lấy settings (không cần authentication)
  @Get('settings')
  async getPublicSettings() {
    return this.adminService.getSettings();
  }
}
