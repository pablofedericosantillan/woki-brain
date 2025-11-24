import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // app.enableCors({
  //   allowedHeaders: "*",
  //   origin: "*",
  //   credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle('Proyecto Test')
    .setDescription('Proyecto Test admin tool')
    .setVersion('1.0')
    .addSecurity('Authorization', {
      type: 'http',
      name: 'Authorization',
      scheme: 'Bearer',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = +(process.env.PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
