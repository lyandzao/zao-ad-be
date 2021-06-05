import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/schemas/user.schema';
import { throwException } from '@/utils';
import { EmailService } from '../email/email.service';
import { RegisterDTO } from './user.dto';
import { AdvertiserFinanceDocument } from '@/schemas/advertiserFinance.schema';
import { Types } from 'mongoose';
import { RechargeDocument } from '@/schemas/recharge.schema';
import * as moment from 'moment';
import { MediaFinanceDocument } from '@/schemas/mediaFinance.schema';
import { WithdrawDocument } from '@/schemas/withdraw.schema';
import { AdminFinanceDocument } from '@/schemas/adminFinance.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('AdvertiserFinance')
    private advertiserFinanceModel: Model<AdvertiserFinanceDocument>,
    @InjectModel('Recharge') private rechargeModel: Model<RechargeDocument>,
    @InjectModel('Withdraw') private withdrawModel: Model<WithdrawDocument>,
    @InjectModel('MediaFinance')
    private mediaFinanceModel: Model<MediaFinanceDocument>,
    @InjectModel('AdminFinance')
    private adminFinanceModel: Model<AdminFinanceDocument>,
    private readonly emailService: EmailService,
  ) {}

  async findUserByUserName(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }

  async findUser(username: string, password: string): Promise<User> {
    return this.userModel.findOne({ username, password });
  }

  async register(user: RegisterDTO) {
    const { username } = user;
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const hadUser = await this.findUserByUserName(username);
    if (hadUser) {
      throwException('邮箱已注册,请登录或重试');
    } else {
      const newUser = new this.userModel(user);
      const newFinance = new this.advertiserFinanceModel({
        user_id: newUser._id,
        balance: 0,
        today_cost: 0,
        today_date_string: today,
      });
      newFinance.save();
      newUser.save();
      return newUser;
    }
  }

  async getAdvertiserFinanceInfo(user_id: string) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const advertiserFinanceInfo = await this.advertiserFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });
    console.log(advertiserFinanceInfo);
    if (advertiserFinanceInfo?.today_date_string !== today) {
      await this.advertiserFinanceModel.updateOne(
        { user_id: Types.ObjectId(user_id) },
        { today_cost: 0, today_date_string: today },
      );
    }
    return this.advertiserFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });
  }

  async getMediaFinanceInfo(user_id: string) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const mediaFinanceInfo = await this.mediaFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });
    console.log(mediaFinanceInfo);
    if (mediaFinanceInfo?.today_date_string !== today) {
      await this.mediaFinanceModel.updateOne(
        { user_id: Types.ObjectId(user_id) },
        { today_earnings: 0, today_date_string: today },
      );
    }
    return this.mediaFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });
  }

  async getAdminFinanceInfo(user_id: string) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const adminFinanceInfo = await this.adminFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });

    if (adminFinanceInfo?.today_date_string !== today) {
      await this.adminFinanceModel.updateOne(
        { user_id: Types.ObjectId(user_id) },
        { today_earnings: 0, today_date_string: today },
      );
    }
    return this.adminFinanceModel.findOne({
      user_id: Types.ObjectId(user_id),
    });
  }

  async getSplashList() {
    return this.userModel.aggregate([
      {
        $lookup: {
          from: 'apps',
          localField: '_id',
          foreignField: 'user_id',
          as: 'apps',
        },
      },
      {
        $unwind: '$apps',
      },
      {
        $project: {
          user_id: '$_id',
          user_name: '$name',
          app_name: '$apps.app_name',
          app_id: '$apps._id',
        },
      },
      {
        $lookup: {
          from: 'codes',
          localField: 'app_id',
          foreignField: 'app_id',
          as: 'codes',
        },
      },
      {
        $unwind: '$codes',
      },
      {
        $project: {
          user_id: 1,
          user_name: 1,
          app_id: 1,
          app_name: 1,
          code_id: '$codes._id',
          code_name: '$codes.code_name',
          code_type: '$codes.code_type',
          code_price: '$codes.price',
          code_date: '$codes.date',
        },
      },
      {
        $match: {
          code_type: 'splash',
        },
      },
      {
        $group: {
          _id: '$app_id',
          user_id: { $first: '$user_id' },
          user_name: { $first: '$user_name' },
          app_id: { $first: '$app_id' },
          app_name: { $first: '$app_name' },
          codes: {
            $push: {
              code_id: '$code_id',
              code_name: '$code_name',
              code_price: '$code_price',
              code_date: '$code_date',
            },
          },
        },
      },
      {
        $group: {
          _id: '$user_id',
          user_id: { $first: '$user_id' },
          user_name: { $first: '$user_name' },
          apps: {
            $push: {
              app_id: '$app_id',
              app_name: '$app_name',
              codes: '$codes',
            },
          },
        },
      },
    ]);
  }

  async forgetPassword(email: string) {
    return this.emailService.sendEmail(email);
  }

  async updatePassword(username: string, password: string) {
    return this.userModel.updateOne({ username }, { password });
  }

  async updateUser(username: string, name: string, avatar: string) {
    if (avatar) {
      return this.userModel.updateOne({ username }, { name, avatar });
    } else {
      return this.userModel.updateOne({ username }, { name });
    }
  }

  async recharge(user_id: string, amount: number) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const newRecharge = new this.rechargeModel({
      user_id: Types.ObjectId(user_id),
      date_string: today,
      status: 'under_review',
      amount,
    });
    newRecharge.save();
    return newRecharge;
  }

  async getReviewRechargeList() {
    return this.rechargeModel.aggregate([
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
          user_id: 1,
          user_name: '$user.name',
          order_id: '$_id',
          amount: 1,
          date_string: 1,
          status: 1,
        },
      },
    ]);
  }

  async reviewRecharge(user_id: string, order_id: string, status: string) {
    if (status === 'pass') {
      const orderInfo = await this.rechargeModel.findOne({
        _id: Types.ObjectId(order_id),
      });
      await this.advertiserFinanceModel.updateOne(
        {
          user_id: Types.ObjectId(user_id),
        },
        {
          $inc: { balance: orderInfo.amount },
        },
      );
    }
    return this.rechargeModel.updateOne(
      { _id: Types.ObjectId(order_id) },
      { status },
    );
  }

  async withdraw(user_id: string, amount: number) {
    const today = moment(Date.now()).format('YYYY-MM-DD');
    const newWithdraw = new this.withdrawModel({
      user_id: Types.ObjectId(user_id),
      date_string: today,
      status: 'under_review',
      amount,
    });
    newWithdraw.save();
    return newWithdraw;
  }

  async getReviewWithdrawList() {
    return this.withdrawModel.aggregate([
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
          user_id: 1,
          user_name: '$user.name',
          order_id: '$_id',
          amount: 1,
          date_string: 1,
          status: 1,
        },
      },
    ]);
  }

  async reviewWithdraw(user_id: string, order_id: string, status: string) {
    if (status === 'pass') {
      const orderInfo = await this.withdrawModel.findOne({
        _id: Types.ObjectId(order_id),
      });
      await this.mediaFinanceModel.updateOne(
        {
          user_id: Types.ObjectId(user_id),
        },
        {
          $inc: { earnings: -orderInfo.amount },
        },
      );
    }
    return this.withdrawModel.updateOne(
      { _id: Types.ObjectId(order_id) },
      { status },
    );
  }

  async getRechargeList(user_id: string) {
    return this.rechargeModel.find({
      user_id: Types.ObjectId(user_id),
    });
  }

  async getWithdrawList(user_id: string) {
    return this.withdrawModel.find({
      user_id: Types.ObjectId(user_id),
    });
  }

  async getMediaList() {
    const res = await this.userModel.aggregate([
      {
        $match: { role: 'media' },
      },
      {
        $lookup: {
          from: 'apps',
          localField: '_id',
          foreignField: 'user_id',
          as: 'app',
        },
      },
      {
        $unwind: '$app',
      },
      {
        $lookup: {
          from: 'codes',
          localField: 'app._id',
          foreignField: 'app_id',
          as: 'codes',
        },
      },
      {
        $group: {
          _id: '$_id',
          media_name: {
            $first: '$name',
          },
          apps: {
            $push: {
              app_name: '$app.app_name',
              app_id: '$app._id',
              codes: '$codes',
            },
          },
        },
      },
    ]);

    return res;
  }
}
