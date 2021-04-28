import { MailerOptions } from '@nestjs-modules/mailer';
import { join } from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

export default <MailerOptions>{
  transport: 'smtps://1064216064@qq.com:gbtivotcjimfbdjc@smtp.qq.com',
  defaults: {
    from: '"nest-modules" <modules@nestjs.com>',
  },
  template: {
    dir: join(__dirname, '../templates/email'),
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
};
