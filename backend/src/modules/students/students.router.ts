import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { StudentsService } from './students.service';
import { CreateEstudianteSchema, UpdateEstudianteSchema } from './dto/estudiante.dto';
import { z } from 'zod';

@Injectable()
export class StudentsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly studentsService: StudentsService,
  ) {}

  public readonly router = this.trpcService.router({
    getEstudiantes: this.trpcService.procedure
      .query(async () => {
        const result = await this.studentsService.findAll(true);
        return result;
      }),

    getEstudianteById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.studentsService.findById(input.id);
      }),

    getEstudianteByUsuarioId: this.trpcService.procedure
      .input(z.object({ usuarioId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.studentsService.findByUsuarioId(input.usuarioId);
      }),

    getEstudianteByCodigo: this.trpcService.procedure
      .input(z.object({ codigo: z.string() }))
      .query(async ({ input }) => {
        return this.studentsService.findByCodigo(input.codigo);
      }),

    createEstudiante: this.trpcService.procedure
      .input(CreateEstudianteSchema)
      .mutation(async ({ input }) => {
        return this.studentsService.create(input);
      }),

    updateEstudiante: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), data: UpdateEstudianteSchema }))
      .mutation(async ({ input }) => {
        return this.studentsService.update(input.id, input.data);
      }),

    deleteEstudiante: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return this.studentsService.delete(input.id);
      }),

    reactivarEstudiante: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ input }) => {
        return this.studentsService.reactivar(input.id);
      }),

    getEstadisticas: this.trpcService.procedure
      .query(async () => {
        return this.studentsService.getEstadisticas();
      }),
  });
}