import {
  ICreativeConfig,
  TAdsDate,
  TAdsTime,
  TCodeType,
  TDirectional,
  TPayMethod,
} from '@/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdsDocument = Ads & Document;

@Schema({ versionKey: false })
export class Ads extends Document {
  @Prop({ required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  media_id: Types.ObjectId;

  @Prop({ required: true, ref: 'Code' })
  code_id: Types.ObjectId;

  @Prop({ required: true })
  ads_name: string;

  @Prop({ required: true })
  code_type: TCodeType;

  @Prop({ required: true })
  directional: Types.Map<TDirectional>;

  @Prop({ required: true })
  ads_date: TAdsDate; // 投放日期

  @Prop({ required: true })
  ads_time: TAdsTime; // 投放时间

  @Prop({ required: true })
  pay_method: TPayMethod; // 支付方式

  @Prop({ required: true })
  payments: number; // 支付数额

  @Prop({ required: true })
  creative_config: Types.Map<ICreativeConfig>;

  // @Prop()
  // vertical_big_img: any; // 竖版大图

  // @Prop()
  // horizontal_big_img: any; // 横版大图
}

export const AdsSchema = SchemaFactory.createForClass(Ads);
