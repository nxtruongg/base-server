import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { IAppConfig } from '@/config/config.interface';

@Injectable()
@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly configService: ConfigService<IAppConfig>) {
    super();
    try {
      const emailConfig = this.configService.get<IAppConfig['email']>('email');
      const { host, port, user, pass } = emailConfig;

      if (!host || !port || !user || !pass) {
        throw new Error('SMTP configuration is incomplete');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      this.logger.log('Nodemailer transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Nodemailer transporter', error);
    }
  }

  async process(job: Job<any>): Promise<void> {
    const { to, subject, content } = job.data;

    try {
      await this.transporter.sendMail({
        from: '"No Reply" <noreply@example.com>',
        to,
        subject,
        text: content,
        html: `<b>${content}</b>`,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
