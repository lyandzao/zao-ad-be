import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdvertiserFinanceDocument = AdvertiserFinance & Document;

@Schema({ versionKey: false })
export class AdvertiserFinance extends Document {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  balance: number;

  // @Prop({ required: true, default: [] })
  // cost_data: Types.Array<{
  //   cost: number;
  //   date_string: string;
  //   date: number;
  // }>;

  @Prop({ required: true })
  today_cost: number;

  @Prop({ required: true })
  today_date_string: string;
}

export const AdvertiserFinanceSchema = SchemaFactory.createForClass(
  AdvertiserFinance,
);
