import { saveFile } from '@/config/file';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdsDTO, UpdateAdsDTO } from './ads.dto';
import { AdsService } from './ads.service';

@UseGuards(AuthGuard('jwt'))
@Controller('/ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post('/create')
  async createAds(@Body() adsBody: AdsDTO, @Request() { user }) {
    // const imgPath = saveFile(img);
    return this.adsService.createAds({
      ...adsBody,
      user_id: user.user_id,
    });
  }

  @Post('/update')
  async updateAds(@Body() adsBody: UpdateAdsDTO, @Request() { user }) {
    return this.adsService.updateAds(adsBody.ads_id, {
      ...adsBody,
      user_id: user.user_id,
    });
  }

  @Get('/list')
  async getAdsList(@Request() { user }) {
    return this.adsService.getList(user.user_id);
  }

  @Get('/info')
  async getAdsInfo(@Query() { ads_id }) {
    return this.adsService.getAdsInfo(ads_id);
  }
}
