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

  async sendPairEmail(user1Email: string, user2Email: string) {
    try {
        await this.mailerService.sendMail({
            to: [user1Email, user2Email], 
            subject: 'Поздравляем! У вас новый random coffee!',
            template: './pair-template', 
            context: {
                user1Email,
                user2Email,
            },
        });
    } catch (error) {
        console.error('Error sending pair email:', error);
        throw error;
    }
}


}
