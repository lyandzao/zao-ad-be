import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlowDataDocument = FlowData & Document;

@Schema({ versionKey: false })
export class FlowData extends Document {
  @Prop()
  gender: string;

  @Prop()
  age: string;

  @Prop()
  location: string;

  @Prop()
  count: number;
}

export const FlowDataSchema = SchemaFactory.createForClass(FlowData);
