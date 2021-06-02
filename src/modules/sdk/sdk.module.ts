import { SdkService } from './sdk.service';
import { Module } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ads, AdsSchema } from '@/schemas/ads.schema';
import { AdsBuried, AdsBuriedSchema } from '@/schemas/adsBuried.schema';
import { Buried, BuriedSchema } from '@/schemas/buried.schema';
import { FlowData, FlowDataSchema } from '@/schemas/flowData.schema';
import { SelfService } from '../self/self.service';
import { SelfModule } from '../self/self.module';
import { Self, SelfSchema } from '@/schemas/self.schema';
import { AdminFinance,AdminFinanceSchema } from '@/schemas/adminFinance.schema';
import {
  AdvertiserFinance,
  AdvertiserFinanceSchema,
} from '@/schemas/advertiserFinance.schema';
import {
  MediaFinance,
  MediaFinanceSchema,
} from '@/schemas/mediaFinance.schema';
import { AdsPayments,AdsPaymentsSchema } from '@/schemas/adsPayments.schema';
import { Code, CodeSchema } from '@/schemas/code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ads.name, schema: AdsSchema, collection: 'ads' },
      { name: Self.name, schema: SelfSchema, collection: 'self' },
      {
        name: AdsBuried.name,
        schema: AdsBuriedSchema,
        collection: 'adsBuried',
      },
      { name: Buried.name, schema: BuriedSchema, collection: 'buried' },
      { name: FlowData.name, schema: FlowDataSchema, collection: 'flow_data' },
      {
        name: MediaFinance.name,
        schema: MediaFinanceSchema,
        collection: 'media_finance',
      },
      {
        name: AdminFinance.name,
        schema: AdminFinanceSchema,
        collection: 'admin_finance',
      },
      {
        name: AdvertiserFinance.name,
        schema: AdvertiserFinanceSchema,
        collection: 'advertiser_finance',
      },
      {
        name: AdsPayments.name,
        schema: AdsPaymentsSchema,
        collection: 'ads_payments',
      },
      { name: Code.name, schema: CodeSchema, collection: 'codes' },
    ]),
    // SelfModule,
  ],
  controllers: [SdkController],
  providers: [SdkService],
  // exports: [SdkService],
})
export class SdkModule {}
