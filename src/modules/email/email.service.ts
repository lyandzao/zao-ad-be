import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  sendEmail(target: string) {
    return this.mailerService.sendMail({
      to: target,
      from: '1064216064@qq.com',
      subject: 'Hello!',
      template: 'welcome',
    });
  }
}
