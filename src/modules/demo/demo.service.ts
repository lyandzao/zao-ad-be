import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsDocument } from '@/schemas/news.schema';
import { VideosDocument } from '@/schemas/videos.schema';

interface IVideoNews {
  big_pic: string;
  big_pic_m: string;
  collection_count: number; //  点赞数
  comment_num: number; // 评论数
  format_published_at: string; // 时间
  h_pic: string; // 封面
  has_collection: boolean;
  has_praise: boolean;
  id: number;
  praise_count: number;
  published_at: string;
  share_url: string;
  title: string; // 标题
  video_fileid: string;
  video_sign: string;
  video_time: string;
  view_count: string;
}

@Injectable()
export class DemoService {
  constructor(
    @InjectModel('News') private newsModel: Model<NewsDocument>,
    @InjectModel('Videos') private videosModel: Model<VideosDocument>,
  ) {}
  async getNewsList() {
    const page = Math.floor(Math.random() * 9);
    return this.newsModel.find().limit(10).skip(page);
  }

  async getVideoNewsList() {
    const page = Math.floor(Math.random() * 5);
    return this.videosModel.find().limit(18).skip(page);
  }
}
