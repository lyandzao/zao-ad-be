import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppDocument = App & Document;

@Schema({ versionKey: false })
export class App extends Document {
  @Prop({ required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  app_name: string;

  @Prop({ required: true })
  app_status: string;

  @Prop({ default: [] })
  shield: number[];

  @Prop({ required: true })
  industry: number;
}

export const AppSchema = SchemaFactory.createForClass(App);
