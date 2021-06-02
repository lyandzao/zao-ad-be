import { SelfDocument } from '@/schemas/self.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { throwException } from '@/utils';
import { User, UserDocument } from '@/schemas/user.schema';
import { AppDocument } from '@/schemas/app.schema';

@Injectable()
export class SelfService {
  constructor(
    @InjectModel('Self') private selfModel: Model<SelfDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('App') private appModel: Model<AppDocument>,
  ) {}

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
    return this.selfModel
      .aggregate([
        {
          $match: { _id: Types.ObjectId(buried_id) },
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
          $project: {
            event: 1,
            app_id: 1,
            data: 1,
            desc: 1,
            app: { $arrayElemAt: ['$app', 0] },
          },
        },
      ])
      .then((items) => items[0]);
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

  async getReport(event_id: string, start: string, end: string) {
    const startStamp = moment(start).valueOf();
    const endStamp = moment(end).valueOf();
    console.log(event_id);
    const res = await this.selfModel.aggregate([
      {
        $match: { _id: Types.ObjectId(event_id) },
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

  async getBuriedFilterList(user_id: string) {
    return this.appModel.aggregate([
      {
        $match: { user_id: Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: 'self',
          localField: '_id',
          foreignField: 'app_id',
          as: 'events',
        },
      },
    ]);
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
              event_name: { $first: '$event' },
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
              event_name: { $first: '$event' },
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
