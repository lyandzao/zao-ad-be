import { BuriedDocument } from '@/schemas/buried.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { getTime } from '@/utils';
import { TRole } from '@/types';
import { AdsDocument } from '@/schemas/ads.schema';
import { CodeDocument } from '@/schemas/code.schema';
import { AdsBuriedDocument } from '@/schemas/adsBuried.schema';
import { AppDocument } from '@/schemas/app.schema';

export type TBuriedType = 'show' | 'click' | string;

@Injectable()
export class ReportService {
  constructor(
    @InjectModel('Buried') private buriedModel: Model<BuriedDocument>,
    @InjectModel('AdsBuried') private adsBuriedModel: Model<AdsBuriedDocument>,
    @InjectModel('Ads') private adsModel: Model<AdsDocument>,
    @InjectModel('Code') private codeModel: Model<CodeDocument>,
    @InjectModel('App') private appModel: Model<AppDocument>,
  ) {}

  // -----------------------media-------------------------------
  async buryPoint(code_id: string, event: TBuriedType) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const hadBuried = await this.buriedModel.findOne({
      code_id: Types.ObjectId(code_id),
      event,
    });
    if (hadBuried) {
      const hadTodayBuried = await this.buriedModel.findOne({
        code_id: Types.ObjectId(code_id),
        event,
        data: { $elemMatch: { date: todayStamp } },
      });
      if (hadTodayBuried) {
        return this.buriedModel.updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
            data: { $elemMatch: { date: todayStamp } },
          },
          { $inc: { 'data.$.value': 1 } },
        );
      } else {
        return this.buriedModel.updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
          },
          {
            $addToSet: {
              data: { date: todayStamp, value: 1, date_string: today },
            },
          },
        );
      }
    } else {
      const newBuried = new this.buriedModel({
        code_id: Types.ObjectId(code_id),
        event,
        data: [{ date: todayStamp, value: 1, date_string: today }],
      });
      newBuried.save();
      return newBuried;
    }
  }

  async getBuriedByDate(
    code_id: string,
    event: string,
    start: string,
    end: string,
  ) {
    const startStamp = moment(start).valueOf();
    const endStamp = moment(end).valueOf();
    const res = await this.buriedModel.aggregate([
      {
        $match: { code_id: Types.ObjectId(code_id), event },
      },
      {
        $unwind: '$data',
      },
      {
        $project: {
          _id: 0,
          date: '$data.date',
          date_string: '$data.date_string',
          value: '$data.value',
          event,
        },
      },
      {
        $match: { date: { $gte: startStamp, $lte: endStamp } },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    console.log(res);
    return res;
  }

  async getReport(
    code_id: string,
    type: 'show' | 'click' | 'click_rate',
    start: string,
    end: string,
  ) {
    switch (type) {
      case 'show':
        return await this.getBuriedByDate(code_id, 'show', start, end);
      case 'click':
        return await this.getBuriedByDate(code_id, 'click', start, end);
      case 'click_rate':
        const show_value = await this.getBuriedByDate(
          code_id,
          'show',
          start,
          end,
        );
        const click_value = await this.getBuriedByDate(
          code_id,
          'click',
          start,
          end,
        );
        return show_value.map((i) => {
          const rate =
            click_value.find((j) => (j.date = i.date)).value / i.value;
          return {
            date_string: i.date_string,
            date: i.date,
            value: rate,
            event: type,
          };
        });
      default:
        break;
    }
  }

  async getTableByMedia(user_id: string, current: number, page_size: number) {
    current = Number(current);
    page_size = Number(page_size);
    const total = await this.codeModel.aggregate([
      {
        $match: { user_id: Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: 'buried',
          localField: '_id',
          foreignField: 'code_id',
          as: 'buried',
        },
      },
      {
        $unwind: '$buried',
      },
      {
        $unwind: '$buried.data',
      },
    ]);
    const res = await this.appModel.aggregate([
      {
        $match: { user_id: Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: 'codes',
          localField: '_id',
          foreignField: 'app_id',
          as: 'codes',
        },
      },
      {
        $unwind: '$codes',
      },
      {
        $lookup: {
          from: 'buried',
          localField: 'codes._id',
          foreignField: 'code_id',
          as: 'buried',
        },
      },
      {
        $unwind: '$buried',
      },
      {
        $unwind: '$buried.data',
      },
      {
        $project: {
          app_name: 1,
          industry: 1,
          code_id: '$codes._id',
          code_name: '$codes.code_name',
          code_type: '$codes.code_type',
          event: '$buried.event',
          date_string: '$buried.data.date_string',
          date: '$buried.data.date',
          value: '$buried.data.value',
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $skip: (current - 1) * page_size,
      },
      {
        $limit: page_size,
      },
    ]);
    return {
      pagination: {
        current,
        page_size,
        total: total.length,
      },
      data: res,
    };
  }

  // ----------------------------admin------------------------------------
  async buryPointByAdmin(code_id: string, event: TBuriedType, date: string) {
    const dateStamp = moment(date).valueOf();
    const hadBuried = await this.buriedModel.findOne({
      code_id: Types.ObjectId(code_id),
      event,
    });
    if (hadBuried) {
      const hadDateBuried = await this.buriedModel.findOne({
        code_id: Types.ObjectId(code_id),
        event,
        data: { $elemMatch: { date: dateStamp } },
      });
      if (hadDateBuried) {
        return this.buriedModel.updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
            data: { $elemMatch: { date: dateStamp } },
          },
          { $inc: { 'data.$.value': 1 } },
        );
      } else {
        return this.buriedModel.updateOne(
          {
            code_id: Types.ObjectId(code_id),
            event,
          },
          {
            $addToSet: {
              data: { date: dateStamp, value: 1, date_string: date },
            },
          },
        );
      }
    } else {
      const newBuried = new this.buriedModel({
        code_id: Types.ObjectId(code_id),
        event,
        data: [{ date: dateStamp, value: 1, date_string: date }],
      });
      newBuried.save();
      return newBuried;
    }
  }

  async buryPointByAdsByAdmin(
    ads_id: string,
    event: TBuriedType,
    date: string,
  ) {
    const dateStamp = moment(date).valueOf();
    const hadBuried = await this.adsBuriedModel.findOne({
      ads_id: Types.ObjectId(ads_id),
      event,
    });
    if (hadBuried) {
      const hadDateBuried = await this.adsBuriedModel.findOne({
        ads_id: Types.ObjectId(ads_id),
        event,
        data: { $elemMatch: { date: dateStamp } },
      });
      if (hadDateBuried) {
        return this.adsBuriedModel.updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
            data: { $elemMatch: { date: dateStamp } },
          },
          { $inc: { 'data.$.value': 1 } },
        );
      } else {
        return this.adsBuriedModel.updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
          },
          {
            $addToSet: {
              data: { date: dateStamp, value: 1, date_string: date },
            },
          },
        );
      }
    } else {
      const newBuried = new this.adsBuriedModel({
        ads_id: Types.ObjectId(ads_id),
        event,
        data: [{ date: dateStamp, value: 1, date_string: date }],
      });
      newBuried.save();
      return newBuried;
    }
  }

  // -----------------------advertiser--------------------------------------
  async buryPointByAds(ads_id: string, event: TBuriedType) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const hadBuried = await this.adsBuriedModel.findOne({
      ads_id: Types.ObjectId(ads_id),
      event,
    });
    if (hadBuried) {
      const hadTodayBuried = await this.adsBuriedModel.findOne({
        ads_id: Types.ObjectId(ads_id),
        event,
        data: { $elemMatch: { date: todayStamp } },
      });
      if (hadTodayBuried) {
        return this.adsBuriedModel.updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
            data: { $elemMatch: { date: todayStamp } },
          },
          { $inc: { 'data.$[].value': 1 } },
        );
      } else {
        return this.adsBuriedModel.updateOne(
          {
            ads_id: Types.ObjectId(ads_id),
            event,
          },
          {
            $addToSet: {
              data: { date: todayStamp, value: 1, date_string: today },
            },
          },
        );
      }
    } else {
      const newBuried = new this.adsBuriedModel({
        ads_id: Types.ObjectId(ads_id),
        event,
        data: [{ date: todayStamp, value: 1, date_string: today }],
      });
      newBuried.save();
      return newBuried;
    }
  }

  async getBuriedByAdsByDate(
    ads_id: string,
    event: string,
    start: string,
    end: string,
  ) {
    const startStamp = moment(start).valueOf();
    const endStamp = moment(end).valueOf();
    const res = await this.adsBuriedModel.aggregate([
      {
        $match: { ads_id: Types.ObjectId(ads_id), event },
      },
      {
        $unwind: '$data',
      },
      {
        $project: {
          _id: 0,
          date: '$data.date',
          date_string: '$data.date_string',
          value: '$data.value',
          event,
        },
      },
      {
        $match: { date: { $gte: startStamp, $lte: endStamp } },
      },
    ]);
    return res;
  }

  async getReportByAds(
    ads_id: string,
    type: 'show' | 'click' | 'click_rate',
    start: string,
    end: string,
  ) {
    console.log(ads_id,type,start,end);
    switch (type) {
      case 'show':
        return await this.getBuriedByAdsByDate(ads_id, 'show', start, end);
      case 'click':
        return await this.getBuriedByAdsByDate(ads_id, 'click', start, end);
      case 'click_rate':
        const show_value = await this.getBuriedByAdsByDate(
          ads_id,
          'show',
          start,
          end,
        );
        const click_value = await this.getBuriedByAdsByDate(
          ads_id,
          'click',
          start,
          end,
        );
        return show_value.map((i) => {
          const rate =
            click_value.find((j) => (j.date = i.date)).value / i.value;
          return {
            date_string: i.date_string,
            date: i.date,
            value: rate,
          };
        });
      default:
        break;
    }
  }

  async getTableByAdvertiser(
    user_id: string,
    current: number,
    page_size: number,
  ) {
    current = Number(current);
    page_size = Number(page_size);
    console.log(user_id);
    const total=await this.adsModel.countDocuments();

    const res = await this.adsModel.aggregate([
      {
        $match: {
          user_id: Types.ObjectId(user_id),
        },
      },
      {
        $lookup: {
          from: 'adsBuried',
          localField: '_id',
          foreignField: 'ads_id',
          as: 'buried',
        },
      },
      {
        $unwind: '$buried',
      },
      {
        $unwind: '$buried.data',
      },
      {
        $project: {
          ads_name: 1,
          ads_amount:1,
          pay_method: 1,
          payments: 1,
          code_type: 1,
          buried_event: '$buried.event',
          buried_date: '$buried.data.date',
          buried_date_string: '$buried.data.date_string',
          buried_value: '$buried.data.value',
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $skip: (current - 1) * page_size,
      },
      {
        $limit: page_size,
      },
    ]);
    return {
      pagination: {
        current,
        page_size,
        total: total,
      },
      data: res,
    };
  }
}
