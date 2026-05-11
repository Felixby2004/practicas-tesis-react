import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { CoordinatorService } from './coordinator.service';
import { z } from 'zod';

@Injectable()
export class CoordinatorRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly coordinatorService: CoordinatorService,
  ) {}

  public readonly router = this.trpcService.router({
    getDashboard: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.coordinatorService.getDashboard(ctx.user.id);
      }),

    getPostulacionesByFacultad: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.coordinatorService.getPostulacionesByFacultad(ctx.user.id);
      }),

    getTesisByFacultad: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.coordinatorService.getTesisByFacultad(ctx.user.id);
      }),

    getEstadisticasByFacultad: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.coordinatorService.getEstadisticasByFacultad(ctx.user.id);
      }),

    getPostulanteDetalles: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string() }))
      .query(async ({ input }) => {
        return this.coordinatorService.getPostulanteDetalles(input.postulacionId);
      }),

    aprobarPostulante: this.trpcService.procedure
      .input(z.object({
        postulacionId: z.string(),
        docenteId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return this.coordinatorService.aprobarPostulante(
          input.postulacionId,
          input.docenteId
        );
      }),

    rechazarPostulante: this.trpcService.procedure
      .input(z.object({
        postulacionId: z.string(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return this.coordinatorService.rechazarPostulante(
          input.postulacionId,
          input.motivo
        );
      }),

    getDocentesByFacultad: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.coordinatorService.getDocentesByFacultad(ctx.user.id);
      }),
  });
}