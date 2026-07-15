import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix
  app.setGlobalPrefix('api', { exclude: ['sitemap.xml'] });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable CORS
  const clientUrl = configService.get<string>('CLIENT_URL') || 'https://edulumix.in';
  const isDev = configService.get<string>('NODE_ENV') === 'development';
  app.enableCors({
    origin: isDev ? true : clientUrl,
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 NestJS server running on: http://localhost:${port}/api`);
}
bootstrap();
