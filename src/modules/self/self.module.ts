import { SelfService } from './self.service';
import { Module } from '@nestjs/common';
import { SelfController } from './self.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Self, SelfSchema } from '@/schemas/self.schema';
import { UserSchema, User } from '@/schemas/user.schema';
import { App, AppSchema } from '@/schemas/app.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Self.name, schema: SelfSchema, collection: 'self' },
      { name: User.name, schema: UserSchema, collection: 'users' },
      { name: App.name, schema: AppSchema, collection: 'apps' },
    ]),
  ],
  controllers: [SelfController],
  providers: [SelfService],
  exports:[SelfService]
})
export class SelfModule {}
