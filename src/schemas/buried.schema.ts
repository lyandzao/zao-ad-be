import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BuriedDocument = Buried & Document;

@Schema({ versionKey: false })
export class Buried extends Document {
  @Prop({ required: true, ref: 'Code' })
  code_id: Types.ObjectId;

  @Prop({ required: true })
  event: string;

  @Prop({ required: true, default: [] })
  data: Types.Array<{
    date_string: string;
    date: number;
    value: number;
  }>;
}

export const BuriedSchema = SchemaFactory.createForClass(Buried);
