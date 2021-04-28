import { AdsService } from './ads.service';
import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Ads, AdsSchema } from '@/schemas/ads.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ads.name, schema: AdsSchema, collection: 'ads' },
    ]),
  ],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
