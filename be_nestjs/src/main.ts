import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SerializeBigIntInterceptor } from './common/interceptors/serialize-bigint.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Debug: Kiểm tra file .env
  const envPath = join(process.cwd(), '.env');
  console.log('=== Environment Debug ===');
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Looking for .env at: ${envPath}`);
  console.log(`.env file exists: ${fs.existsSync(envPath)}`);
  if (fs.existsSync(envPath)) {
    console.log('.env file found!');
  } else {
    console.warn('.env file NOT found at expected location!');
  }
  console.log('=========================');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set global API prefix to match FE base URL (/api)
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory (without API prefix)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    index: false,
  });

  // Enable CORS for Vite dev server
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Type'],
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Convert all BigInt in responses to number
  app.useGlobalInterceptors(new SerializeBigIntInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
