import { AdsDocument } from '@/schemas/ads.schema';
import { AdsPaymentsDocument } from '@/schemas/adsPayments.schema';
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
import { AdsBuriedDocument } from '@/schemas/adsBuried.schema';
import * as moment from 'moment';

export interface IAds {
  user_id: string;
  ads_name: string; //  投放名称
  // media_id: string; // 媒体id
  code_id: string; // 广告位id
  code_type: TCodeType; // 投放的代码位类型

  directional: TDirectional; // 广告定向

  // ads_date: TAdsDate; // 投放日期
  // ads_time: TAdsTime; // 投放时间
  pay_method: TPayMethod; // 支付方式
  payments: number; // 支付数额
  ads_amount: number;

  creative_config: ICreativeConfig; // 创意内容

  // status:string;

  // img: any;
  // vertical_big_img: any; // 竖版大图
  // horizontal_big_img: any; // 横版大图
}

const getOneTimePayments = (ads_config: IAds) => {
  if (!ads_config.payments) {
    return 0;
  }
  if (ads_config.pay_method === 'CPM') {
    return ads_config.payments / 1000;
  }
  if (ads_config.pay_method === 'CPC') {
    return ads_config.payments;
  }
};

@Injectable()
export class AdsService {
  constructor(
    @InjectModel('Ads') private adsModel: Model<AdsDocument>,
    @InjectModel('AdsPayments')
    private adsPaymentsModel: Model<AdsPaymentsDocument>,
    @InjectModel('AdsBuried') private adsBuriedModel: Model<AdsBuriedDocument>,
  ) {}

  async createAds(adsConfig: IAds) {
    const { code_id, user_id, directional, creative_config } = adsConfig;
    console.log('create', adsConfig);
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const newAds = new this.adsModel({
      ...adsConfig,
      user_id: Types.ObjectId(user_id),
      code_id: Types.ObjectId(code_id),
      directional: JSON.parse(directional as any),
      creative_config: JSON.parse(creative_config as any),
      status: 'under_review',
    });
    const newAdsPayments = new this.adsPaymentsModel({
      user_id: Types.ObjectId(user_id),
      ads_id: newAds._id,
      ad_remaining_amount: adsConfig.ads_amount ? adsConfig.ads_amount : 0,
      one_time_payment: getOneTimePayments(adsConfig),
    });
    await this.adsBuriedModel.insertMany([
      {
        ads_id: newAds._id,
        event: 'show',
        data: [
          {
            date_string: today,
            date: todayStamp,
            value: 0,
          },
        ],
      },
      {
        ads_id: newAds._id,
        event: 'click',
        data: [
          {
            date_string: today,
            date: todayStamp,
            value: 0,
          },
        ],
      },
    ]);
    newAdsPayments.save();
    newAds.save();
    return newAds;
  }

  async deleteAds(ads_id: string) {
    await this.adsBuriedModel.deleteMany({ ads_id: Types.ObjectId(ads_id) });
    await this.adsPaymentsModel.deleteOne({ ads_id: Types.ObjectId(ads_id) });
    await this.adsModel.deleteOne({ _id: Types.ObjectId(ads_id) });
    return 'ok';
  }

  async changeAdsStatus(ads_id: string, status: string) {
    await this.adsModel.updateOne({ _id: Types.ObjectId(ads_id) }, { status });
  }

  async updateAds(ads_id: string, adsConfig: IAds) {
    const {
      directional,
      creative_config,
      ads_name,
      pay_method,
      payments,
      ads_amount,
    } = adsConfig;

    console.log('update', adsConfig);
    console.log(ads_name);

    return this.adsModel.updateOne(
      { _id: Types.ObjectId(ads_id) },
      {
        ads_name,
        pay_method,
        payments,
        ads_amount,
        directional: JSON.parse(directional as any),
        creative_config: JSON.parse(creative_config as any),
      },
    );
  }

  async getList(user_id: string) {
    return this.adsModel.find({ user_id: Types.ObjectId(user_id) });
  }

  async getReviewAdsList() {
    return this.adsModel.aggregate([
      {
        $match: { status: 'under_review' },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          ads_id: '$_id',
          ads_name: 1,
          code_type: 1,
          pay_method: 1,
          payments: 1,
          status: 1,
          ads_amount: 1,
          user_name: '$user.name',
        },
      },
    ]);
  }

  async review(ads_id: string, status: string) {
    return this.adsModel.updateOne({ _id: Types.ObjectId(ads_id) }, { status });
  }

  async getAdsInfo(ads_id: string) {
    return this.adsModel.findOne({ _id: Types.ObjectId(ads_id) });
  }

  async getAdsSummary(user_id: string) {
    const running_count = await this.adsModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      status: 'running',
    });
    const under_review_count = await this.adsModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      status: 'under_review',
    });
    const no_pass_count = await this.adsModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      status: 'no_pass',
    });
    return {
      running: running_count,
      under_review: under_review_count,
      no_pass: no_pass_count,
    };
  }
}
