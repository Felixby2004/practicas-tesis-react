import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { CompaniesService } from './companies.service';
import { CreateEmpresaSchema, UpdateEmpresaSchema, CreateConvenioSchema } from './dto/empresa.dto';
import { z } from 'zod';

@Injectable()
export class CompaniesRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly companiesService: CompaniesService,
  ) {}

  public readonly router = this.trpcService.router({
    getEmpresas: this.trpcService.procedure
      .query(async () => {
        return this.companiesService.findAll();
      }),

    getEmpresaById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.companiesService.findById(input.id);
      }),

    createEmpresa: this.trpcService.procedure
      .input(CreateEmpresaSchema)
      .mutation(async ({ input }) => {
        return this.companiesService.create(input);
      }),

    updateEmpresa: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), data: UpdateEmpresaSchema }))
      .mutation(async ({ input }) => {
        return this.companiesService.update(input.id, input.data);
      }),

    deleteEmpresa: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return this.companiesService.delete(input.id);
      }),

    addConvenio: this.trpcService.procedure
      .input(CreateConvenioSchema)
      .mutation(async ({ input }) => {
        return this.companiesService.addConvenio({
          empresa_id: input.empresa_id,
          tipo: input.tipo,
          fecha_inicio: new Date(input.fecha_inicio),
          fecha_fin: new Date(input.fecha_fin),
          archivo_url: input.archivo_url || null,
        });
      }),

    getConvenios: this.trpcService.procedure
      .input(z.object({ empresaId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.companiesService.getConvenios(input.empresaId);
      }),

    assignRepresentative: this.trpcService.procedure
      .input(z.object({
        usuarioId: z.string().uuid(),
        empresaId: z.string().uuid(),
        cargo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return this.companiesService.assignRepresentative(
          input.usuarioId,
          input.empresaId,
          input.cargo
        );
      }),

    getMyCompany: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.id) {
          return null;
        }
        return this.companiesService.getCompanyByRepresentativeId(ctx.user.id);
      }),
  });
}