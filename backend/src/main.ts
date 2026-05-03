import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrpcRouter } from './trpc/trpc.router';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from './trpc/contexts/auth.context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const trpcRouter = app.get(TrpcRouter);
  
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter.appRouter,
      createContext,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`tRPC endpoint is running on: http://localhost:${port}/trpc`);
}
bootstrap();
