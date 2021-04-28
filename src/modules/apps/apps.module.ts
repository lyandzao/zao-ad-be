import { CodeModule } from '../code/code.module';
import { AppsController } from './apps.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { App, AppSchema } from '@/schemas/app.schema';
import { AppsService } from './apps.service';

@Module({
  imports: [
    CodeModule,
    MongooseModule.forFeature([
      { name: App.name, schema: AppSchema, collection: 'apps' },
    ]),
  ],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
