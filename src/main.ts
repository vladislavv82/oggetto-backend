import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('auth example')
  .setDescription('The Auth module API')
  .setVersion('1.0')
  .addTag('auth')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://26.159.62.148:3000'],
    credentials: true,
    exposedHeaders: 'set-cookie'
  })

  await app.listen(4200, () => console.log(`Server started on port 4200🚀`));
}
bootstrap();
