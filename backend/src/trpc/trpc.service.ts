import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

export interface TrpcContext {
  user?: {
    id: string;
    email: string;
    nombre_completo?: string;
    rol: string;
  };
}

@Injectable()
export class TrpcService {
  public readonly trpc = initTRPC.context<TrpcContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

  public readonly middleware = this.trpc.middleware;
  public readonly router = this.trpc.router;
  public readonly procedure = this.trpc.procedure;
  public readonly mergeRouters = this.trpc.mergeRouters;
}