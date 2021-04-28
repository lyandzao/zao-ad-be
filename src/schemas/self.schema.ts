import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SelfDocument = Self & Document;

@Schema({ versionKey: false })
export class Self extends Document {
  @Prop({ required: true, ref: 'App' })
  app_id: Types.ObjectId;

  @Prop({ required: true })
  event: string;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true })
  data: Types.Array<{
    date: number;
    date_string;
    show: number;
    click: number;
  }>;
}

export const SelfSchema = SchemaFactory.createForClass(Self);
