import { Types } from 'mongoose';

// 媒体，广告主，管理员
export type TRole = 'media' | 'advertiser' | 'admin';

// 审核中、运行中、审核不通停止
export type TAppStatus = 'under_review' | 'running' | 'no_pass' | 'stop';

// 信息流、banner、开屏广告、激励视频
export type TCodeType = 'stream' | 'banner' | 'splash' | 'reward';

// 广告位状态
export type TCodeStatus = 'running' | 'stop';

// 投放定向
export type TDirectional = {
  gender: 'all' | 'man' | 'woman';
  location: 'all' | string;
  age: 'all' | number;
};

// 投放日期：长期、自定义
export type TAdsDate = 'long_term' | string;

// 投放时间：全天、自定义
export type TAdsTime = 'all_day' | string;

// 千次曝光、前次点击、优化千次曝光、优化千次点击
export type TPayMethod = 'CPM' | 'CPC' | 'oCPM' | 'oCPC';

export interface ICreativeConfig {
  // 创意内容
  // vertical_big_img: any; // 竖版大图
  // horizontal_big_img: any; // 横版大图
  img_type: 'vertical' | 'horizontal';
  img: string;
  desc: string; // 广告描述
  brand_title: string; // 品牌标题
  location_url: string; // 落地页
}

// export enum

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  role: string;
  password: string;
  avatar: string;
  name: string;
}
