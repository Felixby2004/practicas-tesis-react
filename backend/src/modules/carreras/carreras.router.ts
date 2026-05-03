import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { CarrerasService } from './carreras.service';
import { z } from 'zod';

@Injectable()
export class CarrerasRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly carrerasService: CarrerasService,
  ) {}

  public readonly router = this.trpcService.router({
    getCarreras: this.trpcService.procedure
      .query(async () => {
        const result = await this.carrerasService.findAll();
        return result;
      }),

    getCarreraById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.carrerasService.findById(input.id);
      }),
  });
}