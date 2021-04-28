import { SelfService } from './self.service';
import { Module } from '@nestjs/common';
import { SelfController } from './self.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Self, SelfSchema } from '@/schemas/self.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Self.name, schema: SelfSchema, collection: 'self' },
    ]),
  ],
  controllers: [SelfController],
  providers: [SelfService],
})
export class SelfModule {}
