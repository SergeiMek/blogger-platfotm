import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'registration confirmation',
      text: `confirm registration via link https://some.com?code=${code}`,
    });
  }
  async sendChangePasswordEmail(email: string, recoveryCode: string) {
    const registrationSubject = 'Password recovery';
    const registrationMessage = `<h1>Password recovery</h1><p>To finish password recovery please follow the link below:<a href="https://somesite.com/password-recovery?recoveryCode=${recoveryCode}">recovery password</a></p>`;
    await this.mailerService.sendMail({
      to: email,
      subject: registrationSubject,
      text: registrationMessage,
    });
  }
}
