import {
  Controller,
  Get,
  Post,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ----------------------media--------------------------------
  // 埋点
  @Get('/buried')
  async bury(@Query() { code_id, event }) {
    return this.reportService.buryPoint(code_id, event);
  }

  // 获取埋点的数据
  @Get('/report/chart')
  async getChart(@Query() { code_id, type, start, end }) {
    return this.reportService.getReport(code_id, type, start, end);
  }

  @Get('/report/table')
  async getTable(@Request() { user }, @Query() { current, page_size }) {
    return this.reportService.getTableByMedia(user.user_id, current, page_size);
  }

  // -----------------------admin---------------------------------
  // 管理员-埋点
  @Get('/buried/admin')
  async adminBury(@Query() { code_id, event, date }) {
    return this.reportService.buryPointByAdmin(code_id, event, date);
  }
  @Get('/buried/admin/ads')
  async adminBuryByAds(@Query() { ads_id, event, date }) {
    return this.reportService.buryPointByAdsByAdmin(ads_id, event, date);
  }
  // -----------------------advertiser---------------------------------
  @Get('/buried/ads')
  async buryAds(@Query() { ads_id, name }) {
    return this.reportService.buryPointByAds(ads_id, name);
  }

  // 获取埋点的数据
  @Get('/report/chart/ads')
  async getAdsChart(@Query() { ads_id, type, start, end }) {
    return this.reportService.getReportByAds(ads_id, type, start, end);
  }

  @Get('/report/table/ads')
  async getAdsTable(@Request() { user }, @Query() { current, page_size }) {
    return this.reportService.getTableByAdvertiser(
      user.user_id,
      current,
      page_size,
    );
  }
}
