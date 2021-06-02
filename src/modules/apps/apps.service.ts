import { AppDocument } from '@/schemas/app.schema';
import { throwException } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BuriedDocument } from '@/schemas/buried.schema';
import * as moment from 'moment';

@Injectable()
export class AppsService {
  constructor(
    @InjectModel('App') private appModel: Model<AppDocument>,
    @InjectModel('Buried') private buriedModel: Model<BuriedDocument>,
  ) {}

  async createApp(
    app_name: string,
    shield: string,
    industry: number,
    user_id: string,
  ) {
    const hadApp = await this.appModel.findOne({ app_name });
    if (hadApp) {
      throwException('app已创建，请换一个名称试试');
    } else {
      const newApp = new this.appModel({
        app_name,
        industry,
        user_id: Types.ObjectId(user_id),
        app_status: 'under_review',
        shield: shield ? JSON.parse(shield) : [],
      });
      newApp.save();
      return newApp;
    }
  }

  async updateApp(
    app_id: string,
    app_name: string,
    shield: string,
    industry: number,
  ) {
    console.log(JSON.parse(shield));
    console.log(app_id);
    return this.appModel.updateOne(
      { _id: Types.ObjectId(app_id) },
      { app_name, shield: JSON.parse(shield), industry },
    );
  }

  async getAppList(user_id: string) {
    console.log(user_id);
    return this.appModel.find({ user_id: Types.ObjectId(user_id) });
  }

  async getReviewAppList() {
    return this.appModel.aggregate([
      {
        $match: { app_status: 'under_review' },
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
          app_id: '$_id',
          app_name: 1,
          industry: 1,
          user_id: 1,
          app_status: 1,
          user_name: '$user.name',
        },
      },
    ]);
  }

  async review(app_id: string, status: string) {
    return this.appModel.updateOne(
      { _id: Types.ObjectId(app_id) },
      { app_status: status },
    );
  }

  async getAppInfo(app_id: string) {
    console.log(app_id);
    return this.appModel.findOne({ _id: Types.ObjectId(app_id) });
  }

  async getAppInfoList(user_id: string) {
    return this.appModel.aggregate([
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
    ]);
  }

  async getAppSummary(user_id: string) {
    const running_count = await this.appModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      app_status: 'running',
    });
    const under_review_count = await this.appModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      app_status: 'under_review',
    });
    const no_pass_count = await this.appModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      app_status: 'no_pass',
    });
    return {
      running: running_count,
      under_review: under_review_count,
      no_pass: no_pass_count,
    };
  }
}
