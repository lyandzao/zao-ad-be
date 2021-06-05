import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideosDocument = Videos & Document;

@Schema({ versionKey: false })
export class Videos extends Document {
  @Prop()
  big_pic: string;
  @Prop()
  big_pic_m: string;
  @Prop()
  collection_count: number; //  点赞数
  @Prop()
  comment_num: number; // 评论数
  @Prop()
  format_published_at: string; // 时间
  @Prop()
  h_pic: string; // 封面
  @Prop()
  has_collection: boolean;
  @Prop()
  has_praise: boolean;
  @Prop()
  id: number;
  @Prop()
  praise_count: number;
  @Prop()
  published_at: string;
  @Prop()
  share_url: string;
  @Prop()
  title: string; // 标题
  @Prop()
  video_fileid: string;
  @Prop()
  video_sign: string;
  @Prop()
  video_time: string;
  @Prop()
  view_count: string;
}

export const VideosSchema = SchemaFactory.createForClass(Videos);
