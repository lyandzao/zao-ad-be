import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CodeDocument = Code & Document;

@Schema({ versionKey: false })
export class Code extends Document {
  @Prop({ required: true, ref: 'App' })
  app_id: Types.ObjectId;

  @Prop({ required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  code_type: string;

  @Prop({ required: true })
  code_status: string;

  @Prop({ required: true })
  code_name: string;

  @Prop({ default: [] })
  shield: number[];
}

export const CodeSchema = SchemaFactory.createForClass(Code);
