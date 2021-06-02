import {
  ICreativeConfig,
  TAdsDate,
  TAdsTime,
  TCodeType,
  TDirectional,
  TPayMethod,
} from '@/types';

export class AdsDTO {
  code_id: string; // 广告位id
  ads_name: string; //  投放名称
  // media_id: string; // 媒体id
  code_type: TCodeType; // 投放的代码位类型
  directional: TDirectional; // 广告定向
  ads_date: TAdsDate; // 投放日期
  ads_time: TAdsTime; // 投放时间
  pay_method: TPayMethod; // 支付方式
  payments: number; // 支付数额
  creative_config: ICreativeConfig; // 创意内容
  ads_amount:number;
  // vertical_big_img: any; // 竖版大图
  // horizontal_big_img: any; // 横版大图
}

export class UpdateAdsDTO extends AdsDTO {
  ads_id: string;
  ads_name: string; //  投放名称
  directional: TDirectional; // 广告定向
  ads_date: TAdsDate; // 投放日期
  ads_time: TAdsTime; // 投放时间
  pay_method: TPayMethod; // 支付方式
  payments: number; // 支付数额
  creative_config: ICreativeConfig; // 创意内容
  ads_amount:number;
}
