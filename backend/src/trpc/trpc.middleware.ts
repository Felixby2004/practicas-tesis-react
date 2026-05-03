import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createContext } from './contexts/auth.context';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TrpcRouter } from './trpc.router';

@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(private readonly trpcRouter: TrpcRouter) {}

  use(req: Request, res: Response, next: NextFunction) {
    trpcExpress.createExpressMiddleware({
      router: this.trpcRouter.appRouter,
      createContext,
    })(req, res, next);
  }
}