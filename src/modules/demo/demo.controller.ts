import { Controller, Get } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('/demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('/news/list')
  async getNewsList() {
    return this.demoService.getNewsList();
  }
  @Get('/video_news/list')
  async getVideoNewsList() {
    return this.demoService.getVideoNewsList();
  }
}
