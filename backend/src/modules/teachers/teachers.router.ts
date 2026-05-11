import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { TeacherService } from './teachers.service';
import { z } from 'zod';

// Definir el esquema fuera del router
const EvaluarPracticaSchema = z.object({
  postulacion_id: z.string(),
  rubrica: z.any(),
  nota_final: z.number(),
  comentarios: z.string().optional(),
  evaluador_id: z.string(),
});

@Injectable()
export class TeachersRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly teacherService: TeacherService,
  ) {}

  public readonly router = this.trpcService.router({
    getPerfil: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        const docente = await this.teacherService.getPerfil(ctx.user.id);
        return docente;
      }),

    getDashboard: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.teacherService.getDashboard(ctx.user.id);
      }),

    getInformesPendientes: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.teacherService.getInformesPendientes(ctx.user.id);
      }),

    revisarInforme: this.trpcService.procedure
      .input(z.object({
        informeId: z.string(),
        estado: z.enum(['pendiente', 'revisado', 'observado']),
        observaciones: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return this.teacherService.revisarInforme(
          input.informeId,
          input.estado,
          input.observaciones
        );
      }),

    evaluarPractica: this.trpcService.procedure
      .input(EvaluarPracticaSchema)
      .mutation(async ({ input }) => {
        // Asegurar que todos los campos requeridos estén presentes
        const data = {
          postulacion_id: input.postulacion_id,
          rubrica: input.rubrica || {},
          nota_final: input.nota_final,
          comentarios: input.comentarios || '',
          evaluador_id: input.evaluador_id,
        };
        return this.teacherService.evaluarPractica(data);
      }),
  });
}