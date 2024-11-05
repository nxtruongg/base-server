import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  async sendEmail(to: string, subject: string, content: string) {
    await this.emailQueue.add(
      'send-email',
      {
        to,
        subject,
        content,
      },
      {
        attempts: 3, // Thử lại tối đa 3 lần nếu thất bại
      },
    );
  }
}
