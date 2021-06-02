import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppsService } from './apps.service';
import { AppDTO, UpdateAppDTO } from './apps.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('/app')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post('/create')
  async createApp(@Body() appBody: AppDTO, @Request() req) {
    return this.appsService.createApp(
      appBody.app_name,
      appBody.shield,
      appBody.industry,
      req.user.user_id,
    );
  }

  @Post('/update')
  async updateApp(@Body() appBody: UpdateAppDTO) {
    return this.appsService.updateApp(
      appBody.app_id,
      appBody.app_name,
      appBody.shield,
      appBody.industry,
    );
  }

  @Get('/list')
  async getAppList(@Request() req) {
    console.log(req.user);
    return this.appsService.getAppList(req.user.user_id);
  }

  @Get('/info')
  async getAppInfo(@Query() { app_id }) {
    return this.appsService.getAppInfo(app_id);
  }

  @Get('/infoList')
  async getAppInfoList(@Request() req) {
    return this.appsService.getAppInfoList(req.user.user_id);
  }

  @Get('/summary')
  async getAppSummary(@Request() { user }) {
    return this.appsService.getAppSummary(user.user_id);
  }

  @Get('/review/list')
  async getReviewAppList() {
    return this.appsService.getReviewAppList();
  }

  @Get('/review')
  async review(@Query() { app_id, status }) {
    return this.appsService.review(app_id, status);
  }
}
