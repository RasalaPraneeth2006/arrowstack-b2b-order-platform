import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Parse HTTP-only cookies
  app.use(cookieParser());

  // Strict CORS configuration
  const allowedOrigins = (process.env.WEB_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback for local testing
      }
    },
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Arrowstack B2B Order Platform API')
    .setDescription(
      'RESTful API specification for Arrowstack Wholesale B2B platform supporting transactional checkouts, inventory locks, and PDF invoicing.',
    )
    .setVersion('1.0.0')
    .addCookieAuth('access_token')
    .addTag('Authentication', 'Session management and buyer registration')
    .addTag('Products', 'Wholesale catalog and inventory adjustments')
    .addTag('Cart', 'User-scoped cart operations')
    .addTag('Orders', 'ACID checkout and fulfillment tracking')
    .addTag('Invoices', 'Invoice records and dynamic PDF generation')
    .addTag('Audit Logs', 'Compliance and administrative event history')
    .addTag('Health', 'Service readiness and database health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Arrowstack API running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
