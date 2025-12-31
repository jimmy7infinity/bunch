import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Redis client for session storage
  const redisClient = createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  });
  
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();

  // Session middleware for OAuth with Redis store
  const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: true, // Changed to true for OAuth flow
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      sameSite: 'lax', // Allow cookie to be sent on OAuth redirects
    },
  });
  
  app.use(sessionMiddleware);
  
  // Debug middleware to log session
  app.use((req, res, next) => {
    if (req.path.includes('/auth/twitter')) {
      console.log('🔍 OAuth Request:', {
        path: req.path,
        sessionID: req.sessionID,
        hasSession: !!req.session,
        cookies: req.headers.cookie,
      });
    }
    next();
  });

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

  console.log(`🚀 PolyBanter Backend running on http://localhost:${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();

