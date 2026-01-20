import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import session from 'express-session';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Minimal session for OAuth 2.0 state parameter
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 600000, // 10 minutes
        sameSite: 'lax',
      },
    }),
  );

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));

  // CORS configuration
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // In production, add specific extension ID
  if (process.env.NODE_ENV === 'production' && process.env.EXTENSION_ID) {
    allowedOrigins.push(`chrome-extension://${process.env.EXTENSION_ID}`);
  } else {
    // Development: allow all chrome extensions
    allowedOrigins.push(/^chrome-extension:\/\//);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe with security settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Bunch Backend running on http://localhost:${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();

