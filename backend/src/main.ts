import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TrpcRouter } from './trpc/trpc.router';
import { createTrpcContext } from './trpc/contexts/auth.context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const trpcRouter = app.get(TrpcRouter);
  
  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  app.use(helmet());
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // app.setGlobalPrefix('api');
  
  // Configurar tRPC
  app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: trpcRouter.appRouter,
    createContext: createTrpcContext,
  }));
  
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📍 CORS habilitado para http://localhost:3000`);
}
bootstrap();