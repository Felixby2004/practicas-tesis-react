import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { CompanyRepService } from './company-rep.service';
import { z } from 'zod';

@Injectable()
export class CompanyRepRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly companyRepService: CompanyRepService,
  ) {}

  public readonly router = this.trpcService.router({
    getDashboard: this.trpcService.procedure
      .input(z.object({ representanteId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.companyRepService.getDashboard(input.representanteId);
      }),

    getOfertasByEmpresa: this.trpcService.procedure
      .input(z.object({ representanteId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.companyRepService.getOfertasByEmpresa(input.representanteId);
      }),

    getPostulantesByOferta: this.trpcService.procedure
      .input(z.object({ ofertaId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.companyRepService.getPostulantesByOferta(input.ofertaId);
      }),

    actualizarEstadoPostulacion: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string().uuid(), estado: z.string() }))
      .mutation(async ({ input }) => {
        return this.companyRepService.actualizarEstadoPostulacion(input.postulacionId, input.estado);
      }),
  });
}
