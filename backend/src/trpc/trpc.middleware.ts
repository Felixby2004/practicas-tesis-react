import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { TrpcRouter } from './trpc.router';
import { createTrpcContext } from './contexts/auth.context';

@Injectable()
export class TrpcMiddleware implements NestMiddleware {
  constructor(private readonly trpcRouter: TrpcRouter) {}

  use(req: Request, res: Response, next: NextFunction) {
    trpcExpress.createExpressMiddleware({
      router: this.trpcRouter.appRouter,
      createContext: createTrpcContext,
    })(req, res, next);
  }
}