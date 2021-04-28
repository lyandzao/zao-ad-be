import { TRole } from '@/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
