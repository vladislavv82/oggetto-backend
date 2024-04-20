import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module'
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { MeetsModule } from './meets/meets.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    MailModule,
    RolesModule,
    MeetsModule,
  ],
})
export class AppModule {}
