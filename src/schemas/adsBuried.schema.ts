import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdsBuriedDocument = AdsBuried & Document;

@Schema({ versionKey: false })
export class AdsBuried extends Document {
  @Prop({ required: true, ref: 'ads' })
  ads_id: Types.ObjectId;

  @Prop({ required: true })
  event: string;

  @Prop({ required: true })
  data: Types.Array<{
    date_string: string;
    date: number;
    value: number;
  }>;
}

export const AdsBuriedSchema = SchemaFactory.createForClass(AdsBuried);
