import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from '@/schemas/news.schema';
import { Videos,VideosSchema } from '@/schemas/videos.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema, collection: 'news' },
      { name: Videos.name, schema: VideosSchema, collection: 'videos' },
    ]),
  ],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
