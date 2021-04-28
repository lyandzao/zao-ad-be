import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Role } from '@/common/decorators/role.decorator';
import { RoleGuard } from '@/common/guards/role.guard';

@Controller()
@UseGuards(RoleGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/app')
  @Role('admin')
  getHello(): string {
    return this.appService.getHello();
  }
}
