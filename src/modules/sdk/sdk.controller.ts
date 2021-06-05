import { Controller, Get, Query } from '@nestjs/common';
import { SdkService } from './sdk.service';

@Controller()
export class SdkController {
  constructor(private readonly SdkService: SdkService) {}

  @Get('/sdk/ad')
  async getAd(@Query() { type, directionalConfig, code_id }) {
    return this.SdkService.getAd(type, directionalConfig, code_id);
  }

  @Get('/sdk/ad/splash')
  async getSplashAd(@Query() { code_id }) {
    return this.SdkService.getSplashAd(code_id);
  }

  @Get('/sdk/ad/event')
  async sendAdEvent(@Query() { ads_id, code_id, type }) {
    return this.SdkService.sendAdEvent(ads_id, code_id, type);
  }

  @Get('/sdk/custom/event')
  async sendEvent(@Query() { app_id, event, type }) {
    return this.SdkService.sendEvent(app_id, event, type);
  }
}
