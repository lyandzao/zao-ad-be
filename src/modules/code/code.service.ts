import { CodeDocument } from '@/schemas/code.schema';
import { throwException } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CodeService {
  constructor(@InjectModel('Code') private codeModel: Model<CodeDocument>) {}

  async createCode(
    user_id: string,
    app_id: string,
    code_name: string,
    code_type: string,
    shield: string,
  ) {
    const hadCode = await this.codeModel.findOne({ code_name });
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
      });
      newCode.save();
      return newCode;
    }
  }

  async updateCode(code_id: string, code_name: string, shield: string) {
    return this.codeModel.updateOne(
      { _id: Types.ObjectId(code_id) },
      { code_name, shield: JSON.parse(shield) },
    );
  }

  async getCodeList(user_id: string) {
    // return this.codeModel.find({ user_id: Types.ObjectId(user_id) });
    console.log(user_id);
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

  async getCodeInfo(code_id: string) {
    console.log(code_id);
    return this.codeModel.findOne({ _id: Types.ObjectId(code_id) });
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
}
