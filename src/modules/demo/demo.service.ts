import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rp = require('request-promise');

interface IVideoNews {
  big_pic: string;
  big_pic_m: string;
  collection_count: number; //  点赞数
  comment_num: number; // 评论数
  format_published_at: string; // 时间
  h_pic: string; // 封面
  has_collection: boolean;
  has_praise: boolean;
  id: number;
  praise_count: number;
  published_at: string;
  share_url: string;
  title: string; // 标题
  video_fileid: string;
  video_sign: string;
  video_time: string;
  view_count: string;
}

@Injectable()
export class DemoService {
  async getNewsList() {
    const page = Math.floor(Math.random() * 100);
    const options = {
      method: 'POST',
      uri: 'https://api.apiopen.top/getWangYiNews',
      form: { page, count: 10 },
      json: true,
    };
    const res = await rp(options).then((res) => (res.result ? res.result : []));
    return res;
  }

  async getVideoNewsList() {
    const page = Math.floor(Math.random() * 30);
    const options = {
      method: 'GET',
      uri: `https://member.guancha.cn/video/list?pageNo=${page}`,
      json: true,
    };
    const res = await rp(options).then((res) => (res.data.items ? res.data.items : []));
    return res;
  }
}
