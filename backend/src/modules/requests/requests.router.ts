import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { RequestsService } from './requests.service';
import { CreateSolicitudSchema, UpdateSolicitudSchema } from './dto/solicitud.dto';
import { z } from 'zod';

@Injectable()
export class RequestsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly requestsService: RequestsService,
  ) {}

  public readonly router = this.trpcService.router({
    createSolicitud: this.trpcService.procedure
      .input(CreateSolicitudSchema)
      .mutation(async ({ input }) => {
        return this.requestsService.create(input);
      }),

    getSolicitudes: this.trpcService.procedure
      .input(z.object({ filtro: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return this.requestsService.findAll(input?.filtro);
      }),

    getSolicitudById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.requestsService.findById(input.id);
      }),

    updateSolicitud: this.trpcService.procedure
      .input(z.object({ 
        id: z.string().uuid(), 
        data: UpdateSolicitudSchema,
        adminId: z.string().uuid(),
      }))
      .mutation(async ({ input }) => {
        return this.requestsService.update(input.id, input.data, input.adminId);
      }),

    deleteSolicitud: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return this.requestsService.delete(input.id);
      }),

    getEstadisticas: this.trpcService.procedure
      .query(async () => {
        return this.requestsService.getEstadisticas();
      }),
  });
}