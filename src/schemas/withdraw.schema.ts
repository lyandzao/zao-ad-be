import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawDocument = Withdraw & Document;

@Schema({ versionKey: false })
export class Withdraw extends Document {
  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  date_string: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  amount: number;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
