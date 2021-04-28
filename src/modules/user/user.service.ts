import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/schemas/user.schema';
import { throwException } from '@/utils';
import { EmailService } from '../email/email.service';
import { RegisterDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
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
    const hadUser = await this.findUserByUserName(username);
    if (hadUser) {
      throwException('邮箱已注册,请登录或重试');
    } else {
      const newUser = new this.userModel(user);
      newUser.save();
      return newUser;
    }
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
      }
    ]);

    return res;
  }
}
