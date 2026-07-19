import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Apply security headers
  app.use(helmet());

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
  const rawClientUrl = configService.get<string>('CLIENT_URL') || 'https://edulumix.in';
  const clientUrl = rawClientUrl.replace(/\/$/, '');
  const isDev = configService.get<string>('NODE_ENV') === 'development';
  const allowedOrigins = [
    clientUrl,
    clientUrl.replace('https://', 'https://www.').replace('http://', 'http://www.'),
  ];
  app.enableCors({
    origin: isDev ? true : allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 NestJS server running on: http://localhost:${port}/api`);
}
bootstrap();
