import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SerializeBigIntInterceptor } from './common/interceptors/serialize-bigint.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix to match FE base URL (/api)
  app.setGlobalPrefix('api');

  // Enable CORS for Vite dev server
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
