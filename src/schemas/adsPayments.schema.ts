import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdsPaymentsDocument = AdsPayments & Document;

@Schema({ versionKey: false })
export class AdsPayments extends Document {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  ads_id: Types.ObjectId;

  @Prop({ required: true })
  ad_remaining_amount: number;

  @Prop({ required: true })
  one_time_payment: number;
}

export const AdsPaymentsSchema = SchemaFactory.createForClass(
  AdsPayments,
);
