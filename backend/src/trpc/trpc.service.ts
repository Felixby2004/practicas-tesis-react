import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './contexts/auth.context';

@Injectable()
export class TrpcService {
  trpc = initTRPC.context<Context>().create();
  publicProcedure = this.trpc.procedure;
  procedure = this.publicProcedure;
  router = this.trpc.router;
  middleware = this.trpc.middleware;

  protectedProcedure = this.publicProcedure.use(
    this.middleware(async ({ ctx, next }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    }),
  );
}
