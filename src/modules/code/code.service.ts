import { CodeDocument } from '@/schemas/code.schema';
import { throwException } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BuriedDocument } from '@/schemas/buried.schema';

@Injectable()
export class CodeService {
  constructor(
    @InjectModel('Code') private codeModel: Model<CodeDocument>,
    @InjectModel('Buried') private buriedModel: Model<BuriedDocument>,
  ) {}

  async createCode(
    user_id: string,
    app_id: string,
    code_name: string,
    code_type: string,
    shield: string,
    price: number,
    date: string,
  ) {
    const hadCode = await this.codeModel.findOne({ code_name, app_id });
    if (hadCode) {
      throwException('代码位已创建，请换一个名称试试');
    } else {
      const newCode = new this.codeModel({
        code_name,
        user_id: Types.ObjectId(user_id),
        code_type,
        app_id: Types.ObjectId(app_id),
        code_status: 'under_review',
        shield: shield ? JSON.parse(shield) : [],
        price: price ? price : 0,
        date: date ? JSON.parse(date) : [],
      });
      newCode.save();
      const newCodeShowBuried = new this.buriedModel({
        code_id: newCode._id,
        event: 'show',
        data: [],
      });
      const newCodeClickBuried = new this.buriedModel({
        code_id: newCode._id,
        event: 'click',
        data: [],
      });
      newCodeShowBuried.save();
      newCodeClickBuried.save();
      return newCode;
    }
  }

  async changeCodeStatus(code_id: string, status: string) {
    return this.codeModel.updateOne(
      { _id: Types.ObjectId(code_id) },
      { code_status: status },
    );
  }

  async updateCode(code_id: string, code_name: string, shield: string) {
    return this.codeModel.updateOne(
      { _id: Types.ObjectId(code_id) },
      { code_name, shield: JSON.parse(shield) },
    );
  }

  async getCodeList(user_id: string) {
    return this.codeModel.aggregate([
      {
        $match: { user_id: Types.ObjectId(user_id) },
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
    ]);
  }

  async deleteCode(code_id: string) {
    await this.codeModel.deleteOne({ _id: Types.ObjectId(code_id) });
    await this.buriedModel.deleteMany({ code_id: Types.ObjectId(code_id) });
    return 'ok';
  }

  async getReviewCodeList() {
    return this.codeModel.aggregate([
      {
        $match: { code_status: 'under_review' },
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
          code_id: '$_id',
          app_id: 1,
          app_name: '$app.app_name',
          industry: '$app.industry',
          code_type: 1,
          code_name: 1,
          user_id: 1,
          code_status: 1,
          user_name: '$user.name',
        },
      },
    ]);
  }

  async review(code_id: string, status: string) {
    return this.codeModel.updateOne(
      { _id: Types.ObjectId(code_id) },
      { code_status: status },
    );
  }

  async getFilterCodeList(app_id: string) {
    // return this.codeModel.find({ app_id: Types.ObjectId(app_id) });
    console.log(app_id);
    return this.codeModel.aggregate([
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
    ]);
  }

  async getCodeInfo(code_id: string) {
    return this.codeModel
      .aggregate([
        {
          $match: { _id: Types.ObjectId(code_id) },
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
            shield: 1,
            code_name: 1,
            code_type: 1,
            app_id: 1,
            code_status: 1,
            user_id: 1,
            price: 1,
            date: 1,
            app: { $arrayElemAt: ['$app', 0] },
          },
        },
      ])
      .then((items) => items[0]);
  }

  async getCodeName(code_id: string) {
    const res = await this.codeModel.aggregate([
      {
        $match: { _id: Types.ObjectId(code_id) },
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
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);
    return `${res[0].user[0].name}/${res[0].app[0].app_name}/${res[0].code_name}`;
  }

  async getCodeSummary(user_id: string) {
    const running_count = await this.codeModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      code_status: 'running',
    });
    const under_review_count = await this.codeModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      code_status: 'under_review',
    });
    const no_pass_count = await this.codeModel.countDocuments({
      user_id: Types.ObjectId(user_id),
      code_status: 'no_pass',
    });
    return {
      running: running_count,
      under_review: under_review_count,
      no_pass: no_pass_count,
    };
  }
}
