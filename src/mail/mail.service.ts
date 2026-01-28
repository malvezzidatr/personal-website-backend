import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendContactEmail(dto: SendMailDto): Promise<void> {
    await this.resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: this.configService.get<string>('MAIL_TO'),
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
