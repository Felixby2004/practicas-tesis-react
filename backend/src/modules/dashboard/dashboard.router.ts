import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { DashboardService } from './dashboard.service';
import { z } from 'zod';

@Injectable()
export class DashboardRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly dashboardService: DashboardService,
  ) {}

  public readonly router = this.trpcService.router({
    getMetricasGenerales: this.trpcService.procedure
      .query(async () => {
        console.log('getMetricasGenerales llamado');
        const result = await this.dashboardService.getMetricasGenerales();
        console.log('getMetricasGenerales resultado:', result);
        return result;
      }),

    getEstadisticasTesis: this.trpcService.procedure
      .query(async () => {
        console.log('getEstadisticasTesis llamado');
        const result = await this.dashboardService.getEstadisticasTesis();
        console.log('getEstadisticasTesis resultado:', result);
        return result;
      }),

    getEstadisticasEmpresas: this.trpcService.procedure
      .query(async () => {
        console.log('getEstadisticasEmpresas llamado');
        const result = await this.dashboardService.getEstadisticasEmpresas();
        console.log('getEstadisticasEmpresas resultado:', result);
        return result;
      }),

    getEstadisticasPracticas: this.trpcService.procedure
      .query(async () => {
        console.log('getEstadisticasPracticas llamado');
        const result = await this.dashboardService.getEstadisticasPracticas();
        console.log('getEstadisticasPracticas resultado:', result);
        return result;
      }),

    getActividadReciente: this.trpcService.procedure
      .input(z.object({ limite: z.number().default(10) }))
      .query(async ({ input }) => {
        console.log('getActividadReciente llamado con limite:', input.limite);
        const result = await this.dashboardService.getActividadReciente(input.limite);
        console.log('getActividadReciente resultado:', result);
        return result;
      }),
  });
}