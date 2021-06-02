import { AdsService } from './ads.service';
import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ads, AdsSchema } from '@/schemas/ads.schema';
import { AdsPayments,AdsPaymentsSchema } from '@/schemas/adsPayments.schema';
import { AdsBuried, AdsBuriedSchema } from '@/schemas/adsBuried.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ads.name, schema: AdsSchema, collection: 'ads' },
      { name: AdsPayments.name, schema: AdsPaymentsSchema, collection: 'ads_payments' },      {
        name: AdsBuried.name,
        schema: AdsBuriedSchema,
        collection: 'adsBuried',
      },
    ]),
  ],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
