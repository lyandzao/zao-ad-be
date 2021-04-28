import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get('/email')
  sendEmail(@Query() { email }) {
    return this.emailService.sendEmail(email);
  }
}
