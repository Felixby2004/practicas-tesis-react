import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { ThesisService } from './thesis.service';
import { z } from 'zod';

const CreateProyectoSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(10),
  estudiante_id: z.string().uuid(),
  asesor_id: z.string().uuid(),
});

const UpdateProyectoSchema = z.object({
  titulo: z.string().optional(),
  descripcion: z.string().optional(),
  estado: z.enum(['propuesta', 'en_curso', 'sustentada', 'finalizada']).optional(),
});

const AddEntregableSchema = z.object({
  tesis_id: z.string().uuid(),
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  fecha_limite: z.string(),
});

const AddJuradoSchema = z.object({
  tesis_id: z.string().uuid(),
  docente_id: z.string().uuid(),
  cargo: z.string().optional(),
});

const RegistrarSustentacionSchema = z.object({
  tesis_id: z.string().uuid(),
  fecha_hora: z.string(),
  lugar: z.string().optional(),
  resultado: z.string().optional(),
  acta_url: z.string().optional(),
});
const UpdateEntregableSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(['pendiente', 'entregado', 'observado', 'aprobado']),
});

const DeleteJuradoSchema = z.object({
  id: z.string().uuid(),
});


@Injectable()
export class ThesisRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly thesisService: ThesisService,
  ) {}

  public readonly router = this.trpcService.router({
    getProyectos: this.trpcService.procedure
      .query(async () => {
        return this.thesisService.findAll();
      }),

    getProyectoById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.thesisService.findById(input.id);
      }),

    createProyecto: this.trpcService.procedure
      .input(CreateProyectoSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.create(input);
      }),

    updateProyecto: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), data: UpdateProyectoSchema }))
      .mutation(async ({ input }) => {
        return this.thesisService.update(input.id, input.data);
      }),

    deleteProyecto: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return this.thesisService.delete(input.id);
      }),

    addEntregable: this.trpcService.procedure
      .input(AddEntregableSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.addEntregable(input);
      }),

    addJurado: this.trpcService.procedure
      .input(AddJuradoSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.addJurado(input);
      }),

    registrarSustentacion: this.trpcService.procedure
      .input(RegistrarSustentacionSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.registrarSustentacion(input);
      }),

    updateEntregable: this.trpcService.procedure
      .input(UpdateEntregableSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.updateEntregable(input.id, input.estado);
      }),

    deleteJurado: this.trpcService.procedure
      .input(DeleteJuradoSchema)
      .mutation(async ({ input }) => {
        return this.thesisService.deleteJurado(input.id);
      }),
  });
}