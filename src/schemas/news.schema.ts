import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NewsDocument = News & Document;

@Schema({ versionKey: false })
export class News extends Document {
  @Prop()
  uniquekey: string;
  @Prop()
  title: string;
  @Prop()
  date: string;
  @Prop()
  category: string;
  @Prop()
  author_name: string;
  @Prop()
  url: string;
  @Prop()
  thumbnail_pic_s: string;
  @Prop()
  is_content: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);
