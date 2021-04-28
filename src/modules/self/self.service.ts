import { SelfDocument } from '@/schemas/self.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { throwException } from '@/utils';

@Injectable()
export class SelfService {
  constructor(@InjectModel('Self') private selfModel: Model<SelfDocument>) {}

  async createBuriedPoint(app_id: string, event: string, desc: string) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const todayStamp = moment(today).valueOf();
    const hadSelfBuried = await this.selfModel.findOne({
      app_id: Types.ObjectId(app_id),
      event,
    });
    if (hadSelfBuried) {
      throwException('已有埋点，请重试');
    } else {
      const newSelf = new this.selfModel({
        app_id: Types.ObjectId(app_id),
        event,
        desc,
        data: [
          {
            date: todayStamp,
            date_string: today,
            click: 0,
            show: 0,
          },
        ],
      });
      newSelf.save();
      return newSelf;
    }
  }

  async updateBuriedPoint(buried_id: string, desc: string) {
    return this.selfModel.updateOne(
      { _id: Types.ObjectId(buried_id) },
      { desc },
    );
  }

  async getBuriedList(app_id: string) {
    return this.selfModel.find({ app_id: Types.ObjectId(app_id) });
  }

  async getBuriedInfo(buried_id: string) {
    return this.selfModel.findOne({ _id: Types.ObjectId(buried_id) });
  }

  async getSelfBuriedName(app_id: string) {
    const res = await this.selfModel.aggregate([
      {
        $match: { app_id: Types.ObjectId(app_id) },
      },
      {
        $lookup: {
          from: 'apps',
          localField: 'app_id',
          foreignField: '_id',
          as: 'app',
        },
      },
      {
        $unwind: '$app',
      },
      {
        $project: {
          app_info: '$app',
        },
      },
    ]);
    return res;
  }

  async triggerBuried(app_id: string, event: string, type: 'show' | 'click') {
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
      throwException(`暂时没有定义埋点事件${event}，请创建`);
    }
  }

  async getReport(app_id: string, event: string, start: string, end: string) {
    const startStamp = moment(start).valueOf();
    const endStamp = moment(end).valueOf();
    const res = await this.selfModel.aggregate([
      {
        $match: { app_id: Types.ObjectId(app_id), event },
      },
      {
        $unwind: '$data',
      },
      {
        $project: {
          date: '$data.date',
          date_string: '$data.date_string',
          click: '$data.click',
          show: '$data.show',
          click_rate: { $divide: ['$data.click', '$data.show'] },
        },
      },
      {
        $match: { date: { $gte: startStamp, $lte: endStamp } },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    return res;
  }

  async getTopBuried(app_id: string, type: 'show' | 'click') {
    switch (type) {
      case 'show':
        return await this.selfModel.aggregate([
          {
            $match: {
              app_id: Types.ObjectId(app_id),
            },
          },
          {
            $unwind: '$data',
          },
          {
            $group: {
              _id: '$event',
              value: { $sum: '$data.show' },
            },
          },
          {
            $sort: { value: -1 },
          },
        ]);
      case 'click':
        return await this.selfModel.aggregate([
          {
            $match: {
              app_id: Types.ObjectId(app_id),
            },
          },
          {
            $unwind: '$data',
          },
          {
            $group: {
              _id: '$event',
              value: { $sum: '$data.click' },
            },
          },
          {
            $sort: { value: -1 },
          },
        ]);
      default:
        break;
    }
  }
}
