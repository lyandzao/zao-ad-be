import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UserSchema, User } from '@/schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { filesOptions } from '@/config/file';
import {
  AdvertiserFinance,
  AdvertiserFinanceSchema,
} from '@/schemas/advertiserFinance.schema';
import { Recharge, RechargeSchema } from '@/schemas/recharge.schema';
import {
  MediaFinance,
  MediaFinanceSchema,
} from '@/schemas/mediaFinance.schema';
import { Withdraw, WithdrawSchema } from '@/schemas/withdraw.schema';
import { AdminFinance,AdminFinanceSchema } from '@/schemas/adminFinance.schema';

@Module({
  imports: [
    EmailModule,
    // MulterModule.register(filesOptions),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'users' },
      {
        name: AdvertiserFinance.name,
        schema: AdvertiserFinanceSchema,
        collection: 'advertiser_finance',
      },
      {
        name: Recharge.name,
        schema: RechargeSchema,
        collection: 'recharge',
      },
      {
        name: Withdraw.name,
        schema: WithdrawSchema,
        collection: 'withdraw',
      },
      {
        name: MediaFinance.name,
        schema: MediaFinanceSchema,
        collection: 'media_finance',
      },
      {
        name: AdminFinance.name,
        schema: AdminFinanceSchema,
        collection: 'admin_finance',
      },
    ]),
  ],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UserModule {}
