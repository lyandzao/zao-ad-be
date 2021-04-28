import { ReportService } from './report.service';
import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Buried, BuriedSchema } from '@/schemas/buried.schema';
import { Ads, AdsSchema } from '@/schemas/ads.schema';
import { Code, CodeSchema } from '@/schemas/code.schema';
import { AdsBuried, AdsBuriedSchema } from '@/schemas/adsBuried.schema';
import { App, AppSchema } from '@/schemas/app.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Buried.name, schema: BuriedSchema, collection: 'buried' },
      {
        name: AdsBuried.name,
        schema: AdsBuriedSchema,
        collection: 'adsBuried',
      },
      { name: Ads.name, schema: AdsSchema, collection: 'ads' },
      { name: Code.name, schema: CodeSchema, collection: 'codes' },
      { name: App.name, schema: AppSchema, collection: 'apps' },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
