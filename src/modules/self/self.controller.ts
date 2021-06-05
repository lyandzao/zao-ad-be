import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SelfService } from './self.service';

@UseGuards(AuthGuard('jwt'))
@Controller('/self')
export class SelfController {
  constructor(private readonly selfService: SelfService) {}

  @Post('/create')
  async createBuried(@Body() { event, app_id, desc }) {
    return this.selfService.createBuriedPoint(app_id, event, desc);
  }
  @Post('/update')
  async updateBuried(@Body() { buried_id, desc }) {
    return this.selfService.updateBuriedPoint(buried_id, desc);
  }

  @Get('/list')
  async getBuriedList(@Query() { app_id }) {
    return this.selfService.getBuriedList(app_id);
  }

  @Get('/filter_list')
  async getBuriedFilterList(@Request() req) {
    return this.selfService.getBuriedFilterList(req.user.user_id);
  }

  @Get('/name')
  async getBuriedName(@Query() { app_id }) {
    return this.selfService.getSelfBuriedName(app_id);
  }

  @Get('/info')
  async getBuriedInfo(@Query() { buried_id }) {
    return this.selfService.getBuriedInfo(buried_id);
  }

  @Get('/trigger')
  async triggerBuried(@Query() { app_id, event, type }) {
    return this.selfService.triggerBuried(app_id, event, type);
  }

  @Get('/report')
  async getReport(@Query() { event_id, start, end }) {
    return this.selfService.getReport(event_id, start, end);
  }

  @Get('/top')
  async getTopBuried(@Query() { app_id, type }) {
    return this.selfService.getTopBuried(app_id, type);
  }

  @Get('/delete')
  async deleteEvent(@Query() { event_id }) {
    return this.selfService.deleteEvent(event_id);
  }
}
