import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UserSchema, User } from '@/schemas/user.schema';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { filesOptions } from '@/config/file';


@Module({
  imports: [
    EmailModule,
    // MulterModule.register(filesOptions),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'users' },
    ]),
  ],
  providers: [ UserService, EmailService],
  exports: [UserService],
})
export class UserModule {}
