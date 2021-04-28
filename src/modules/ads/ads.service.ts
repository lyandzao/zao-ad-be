import { AdsDocument } from '@/schemas/ads.schema';
import {
  ICreativeConfig,
  TAdsDate,
  TAdsTime,
  TCodeType,
  TDirectional,
  TPayMethod,
} from '@/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export interface IAds {
  user_id: string;
  ads_name: string; //  投放名称
  media_id: string; // 媒体id
  code_id: string; // 广告位id
  code_type: TCodeType; // 投放的代码位类型

  directional: TDirectional; // 广告定向

  ads_date: TAdsDate; // 投放日期
  ads_time: TAdsTime; // 投放时间
  pay_method: TPayMethod; // 支付方式
  payments: number; // 支付数额

  creative_config: ICreativeConfig; // 创意内容
  // img: any;
  // vertical_big_img: any; // 竖版大图
  // horizontal_big_img: any; // 横版大图
}

@Injectable()
export class AdsService {
  constructor(@InjectModel('Ads') private adsModel: Model<AdsDocument>) {}

  async createAds(adsConfig: IAds) {
    const {
      media_id,
      code_id,
      user_id,
      directional,
      creative_config,
    } = adsConfig;
    console.log('create', adsConfig);
    const newAds = new this.adsModel({
      ...adsConfig,
      user_id: Types.ObjectId(user_id),
      media_id: Types.ObjectId(media_id),
      code_id: Types.ObjectId(code_id),
      directional: JSON.parse(directional as any),
      creative_config: JSON.parse(creative_config as any),
    });
    newAds.save();
    return newAds;
  }

  async updateAds(ads_id: string, adsConfig: IAds) {
    const {
      directional,
      creative_config,
      ads_name,
      ads_date,
      ads_time,
      pay_method,
      payments,
    } = adsConfig;

    console.log('update', adsConfig);

    return this.adsModel.updateOne(
      { _id: Types.ObjectId(ads_id) },
      {
        ads_name,
        ads_date,
        ads_time,
        pay_method,
        payments,
        directional: JSON.parse(directional as any),
        creative_config: JSON.parse(creative_config as any),
      },
    );
  }

  async getList(user_id: string) {
    return this.adsModel.find({ user_id: Types.ObjectId(user_id) });
  }

  async getAdsInfo(ads_id: string) {
    return this.adsModel.findOne({ _id: Types.ObjectId(ads_id) });
  }
}
