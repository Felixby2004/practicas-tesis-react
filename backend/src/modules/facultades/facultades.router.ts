import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';

@Injectable()
export class FacultadesRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly prisma: PrismaService,
  ) {}

  public readonly router = this.trpcService.router({
    getFacultades: this.trpcService.procedure
      .query(async () => {
        return this.prisma.facultad.findMany({
          where: { activo: true },
          orderBy: { nombre: 'asc' },
        });
      }),

    getFacultadById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.prisma.facultad.findUnique({
          where: { id: input.id },
        });
      }),
  });
}