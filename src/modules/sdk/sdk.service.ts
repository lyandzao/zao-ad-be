import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdsDocument } from '@/schemas/ads.schema';
import { AdsBuriedDocument } from '@/schemas/adsBuried.schema';
import { BuriedDocument } from '@/schemas/buried.schema';
import { FlowDataDocument } from '@/schemas/flowData.schema';
import {
  ISupply,
  IDemand,
  hwmPlan,
  hwmServe,
  getDirectionFlow,
  getCandidates,
} from '@/utils/hwm';
import * as moment from 'moment';
import { SelfService } from '../self/self.service';
import { SelfDocument } from '@/schemas/self.schema';
import { throwException } from '@/utils';
import { AdminFinanceDocument } from '@/schemas/adminFinance.schema';
import { MediaFinanceDocument } from '@/schemas/mediaFinance.schema';
import { AdvertiserFinanceDocument } from '@/schemas/advertiserFinance.schema';
import { AdsPaymentsDocument } from '@/schemas/adsPayments.schema';
import { CodeDocument } from '@/schemas/code.schema';

@Injectable()
export class SdkService {
  constructor(
    @InjectModel('Ads') private adsModel: Model<AdsDocument>,
    @InjectModel('AdsBuried') private adsBuriedModel: Model<AdsBuriedDocument>,
    @InjectModel('Buried') private buriedModel: Model<BuriedDocument>,
    @InjectModel('FlowData') private flowDataModel: Model<FlowDataDocument>,
    @InjectModel('Self') private selfModel: Model<SelfDocument>,
    @InjectModel('AdvertiserFinance')
    private advertiserFinanceModel: Model<AdvertiserFinanceDocument>,
    @InjectModel('MediaFinance')
    private mediaFinanceModel: Model<MediaFinanceDocument>,
    @InjectModel('AdminFinance')
    private adminFinanceModel: Model<AdminFinanceDocument>,
    @InjectModel('AdsPayments')
    private adsPaymentsModel: Model<AdsPaymentsDocument>,
    @InjectModel('Code') private codeModel: Model<CodeDocument>,
  ) {}

  async getSplashAd(code_id: string) {
    const isCodeRunning = await this.codeModel.findOne({
      _id: Types.ObjectId(code_id),
      code_status: 'running',
    });
    if (!isCodeRunning) {
      return [];
    }
    return this.adsModel.aggregate([
      {
        $match: { code_id: Types.ObjectId(code_id), status: 'running' },
      },
      {
        $project: {
          ads_name: 1,
          code_type: 1,
          creative_config: 1,
          advertiser_id: '$user_id',
        },
      },
      {
        $limit: 1,
      },
    ]);
  }

  async getAd(type: string, directionalConfig: string, code_id: string) {
    const isCodeRunning = await this.codeModel.findOne({
      _id: Types.ObjectId(code_id),
      code_status: 'running',
    });
    if (!isCodeRunning) {
      return [];
    }
    console.log(directionalConfig);
    // ???????????????
    let _directionalConfig: any = {
      age: undefined,
      gender: undefined,
      location: undefined,
    };
    if (directionalConfig) {
      _directionalConfig = JSON.parse(directionalConfig);
    }
    console.log(type);
    const supplies: any = await this.flowDataModel.find();
    const demands = await this.adsModel.aggregate([
      {
        $match: { code_type: type, status: 'running' },
      },
      {
        $project: {
          ads_id: '$_id',
          age: '$directional.age',
          gender: '$directional.gender',
          location: '$directional.location',
          ads_amount: '$ads_amount',
          payments: '$payments',
        },
      },
    ]);
    // ???????????????????????????
    const candidatesDemands = await this.adsModel.aggregate([
      {
        $match: { code_type: type, status: 'running' },
      },
      {
        $project: {
          ads_id: '$_id',
          age: '$directional.age',
          gender: '$directional.gender',
          location: '$directional.location',
          ads_amount: '$ads_amount',
          payments: '$payments',
        },
      },
    ]);
    console.log('-------?????????????????????-------');
    console.log(candidatesDemands);
    console.log('++++++++++++++');
    const { orders, rates } = hwmPlan(demands, supplies);
    const candidates = getCandidates(_directionalConfig, candidatesDemands);
    // ??????HWM????????????????????????????????????id
    const adsId = hwmServe(candidates, orders, rates);
    console.log(adsId);
    if (adsId) {
      return this.adsModel.aggregate([
        {
          $match: { _id: Types.ObjectId(adsId), status: 'running' },
        },
        {
          $project: {
            ads_name: 1,
            code_type: 1,
            creative_config: 1,
            advertiser_id: '$user_id',
          },
        },
        {
          $limit: 1,
        },
      ]);
    } else {
      return [];
    }
  }

  async sendAdEvent(ads_id: string, code_id: string, event: 'show' | 'click') {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const hadTodayAdsBuried = await this.adsBuriedModel.findOne({
      ads_id: Types.ObjectId(ads_id),
      event,
      data: { $elemMatch: { date: todayStamp } },
    });
    const hadTodayBuried = await this.buriedModel.findOne({
      code_id: Types.ObjectId(code_id),
      event,
      data: { $elemMatch: { date: todayStamp } },
    });
    // ??????????????????
    if (hadTodayAdsBuried) {
      this.adsBuriedModel
        .updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
            data: { $elemMatch: { date: todayStamp } },
          },
          {
            $inc: { 'data.$.value': 1 },
          },
        )
        .exec();
    } else {
      this.adsBuriedModel
        .updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
          },
          {
            $addToSet: {
              data: { date: todayStamp, value: 1, date_string: today },
            },
          },
        )
        .exec();
    }
    console.log(code_id);
    if (hadTodayBuried) {
      this.buriedModel
        .updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
            data: { $elemMatch: { date: todayStamp } },
          },
          { $inc: { 'data.$.value': 1 } },
        )
        .exec();
    } else {
      this.buriedModel
        .updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
          },
          {
            $addToSet: {
              data: { date: todayStamp, value: 1, date_string: today },
            },
          },
        )
        .exec();
    }
    // ????????????
    await this.adsPaymentsModel.updateOne(
      { ads_id: Types.ObjectId(ads_id) },
      { $inc: { ad_remaining_amount: -1 } },
    );
    const { ad_remaining_amount } = await this.adsPaymentsModel.findOne({
      ads_id: Types.ObjectId(ads_id),
    });
    await this.adsModel.updateOne(
      { _id: Types.ObjectId(ads_id) },
      { ads_amount: ad_remaining_amount },
    );
    const paymentsInfo = await this.adsPaymentsModel.findOne({
      ads_id: Types.ObjectId(ads_id),
    });
    const adsInfo = await this.adsModel.findOne({
      _id: Types.ObjectId(ads_id),
    });
    const codeInfo = await this.codeModel.findOne({
      _id: Types.ObjectId(code_id),
    });

    if (
      (event === 'show' && adsInfo.pay_method === 'CPM') ||
      (event === 'click' && adsInfo.pay_method === 'CPC')
    ) {
      // ????????????
      const media_one_time_payment = paymentsInfo.one_time_payment * 0.5;
      const admin_one_time_payment =
        paymentsInfo.one_time_payment - media_one_time_payment;
      await this.advertiserFinanceModel.updateOne(
        { user_id: adsInfo.user_id },
        { $inc: { balance: -paymentsInfo.one_time_payment } },
      );
      await this.mediaFinanceModel.updateOne(
        { user_id: codeInfo.user_id },
        { $inc: { earnings: media_one_time_payment } },
      );
      await this.adminFinanceModel.updateOne(
        { user_id: Types.ObjectId('60b6030d52178b7ba850b451') },
        { $inc: { earnings: admin_one_time_payment } },
      );
      if (adsInfo.code_type !== 'splash') {
        const advertiserFinanceInfo = await this.advertiserFinanceModel.findOne(
          {
            user_id: adsInfo.user_id,
          },
        );
        const mediaFinanceInfo = await this.mediaFinanceModel.findOne({
          user_id: codeInfo.user_id,
        });
        const adminFinanceInfo = await this.adminFinanceModel.findOne({
          user_id: Types.ObjectId('60b6030d52178b7ba850b451'),
        });
        if (advertiserFinanceInfo.today_date_string === today) {
          await this.advertiserFinanceModel.updateOne(
            {
              user_id: adsInfo.user_id,
            },
            { $inc: { today_cost: paymentsInfo.one_time_payment } },
          );
        } else {
          await this.adminFinanceModel.updateOne(
            {
              user_id: adsInfo.user_id,
            },
            {
              today_cost: paymentsInfo.one_time_payment,
              today_date_string: today,
            },
          );
        }
        if (mediaFinanceInfo.today_date_string === today) {
          await this.mediaFinanceModel.updateOne(
            { user_id: codeInfo.user_id },
            { $inc: { today_earnings: media_one_time_payment } },
          );
        } else {
          await this.mediaFinanceModel.updateOne(
            { user_id: codeInfo.user_id },
            {
              today_earnings: media_one_time_payment,
              today_date_string: today,
            },
          );
        }
        if (adminFinanceInfo.today_date_string === today) {
          await this.adminFinanceModel.updateOne(
            { user_id: Types.ObjectId('60b6030d52178b7ba850b451') },
            { $inc: { today_earnings: media_one_time_payment } },
          );
        } else {
          await this.mediaFinanceModel.updateOne(
            { user_id: Types.ObjectId('60b6030d52178b7ba850b451') },
            {
              today_earnings: media_one_time_payment,
              today_date_string: today,
            },
          );
        }
      }
    }

    return 'ok';
  }

  async sendEvent(app_id: string, event: string, type: 'show' | 'click') {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const hadBuried = this.selfModel.findOne({
      app_id: Types.ObjectId(app_id),
      event,
    });
    if (hadBuried) {
      const hadTodayBuried = await this.selfModel.findOne({
        app_id: Types.ObjectId(app_id),
        event,
        data: { $elemMatch: { date: todayStamp } },
      });
      if (hadTodayBuried) {
        if (type === 'click') {
          return this.selfModel.updateOne(
            {
              app_id: Types.ObjectId(app_id),
              event,
              data: { $elemMatch: { date: todayStamp } },
            },
            { $inc: { 'data.$.click': 1 } },
          );
        } else {
          return this.selfModel.updateOne(
            {
              app_id: Types.ObjectId(app_id),
              event,
              data: { $elemMatch: { date: todayStamp } },
            },
            { $inc: { 'data.$.show': 1 } },
          );
        }
      } else {
        return this.selfModel.updateOne(
          {
            app_id: Types.ObjectId(app_id),
            event,
          },
          {
            $addToSet: {
              data: { date: todayStamp, click: 1, show: 1, date_string: today },
            },
          },
        );
      }
    } else {
      throwException(`??????????????????????????????${event}????????????`);
    }
  }
}
