import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendContactEmail(dto: SendMailDto): Promise<void> {
    await this.transporter.sendMail({
      from: `"Portfolio Contact" <${this.configService.get<string>('MAIL_USER')}>`,
      to: this.configService.get<string>('MAIL_USER'),
      replyTo: dto.email,
      subject: `Contato via Portfolio - ${dto.name}`,
      html: `
        <h2>Nova mensagem do Portfolio</h2>
        <p><strong>Nome:</strong> ${dto.name}</p>
        <p><strong>Email:</strong> ${dto.email}</p>
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p>${dto.message.replace(/\n/g, '<br>')}</p>
      `,
    });
  }
}
