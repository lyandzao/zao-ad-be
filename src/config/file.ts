import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import dayjs = require('dayjs');
import * as nuid from 'nuid';
import { join } from 'path';
import { createWriteStream } from 'fs';

export const filesOptions: MulterOptions = {
  storage: diskStorage({
    //自定义路径
    destination: `./public/uploads/${dayjs().format('YYYY-MM-DD')}`,
    filename: (req, file, cb) => {
      // 自定义文件名
      const filename = `${nuid.next()}.${file.mimetype.split('/')[1]}`;
      return cb(null, filename);
      // return  cb(null, file.originalname);
    },
  }),
};

export const saveFile = (file: any) => {
  console.log(file);
  const filename = `${nuid.next()}.${file.mimetype.split('/')[1]}`;
  const res = createWriteStream(`./public/uploads/${dayjs().format('YYYY-MM-DD')}/${filename}`);
  res.write(file.buffer)
  return res.path;
};
