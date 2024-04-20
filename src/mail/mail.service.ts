import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
        ) {}

    async sendUserConfirmation(email: string, token: string) {
    const url = `${this.configService.get('CLIENT_DOMAIN')}/api/auth/confirm?token=${token}`; //localhost:4200 -> client url

    console.log(url);

    try {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to Nest App! Confirm your Email',
            template: './confirmation', 
            context: { 
              name: email,
              url,
            },
          });
    }catch(error){
        console.log(error);
    }
  }
}
