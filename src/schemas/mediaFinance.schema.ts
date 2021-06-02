import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaFinanceDocument = MediaFinance & Document;

@Schema({ versionKey: false })
export class MediaFinance extends Document {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  earnings: number;

  @Prop({ required: true })
  today_earnings: number;

  @Prop({ required: true })
  today_date_string: string;
}

export const MediaFinanceSchema = SchemaFactory.createForClass(
  MediaFinance,
);
