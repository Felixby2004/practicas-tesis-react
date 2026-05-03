import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { InternshipsService } from './internships.service';
import { z } from 'zod';

const CreateOfertaSchema = z.object({
  empresa_id: z.string().uuid(),
  titulo: z.string().min(3).max(200),
  descripcion: z.string().min(10),
  requisitos: z.string().min(10),
  fecha_limite_postulacion: z.string(),
  vacantes: z.number().int().min(1),
});

const UpdateOfertaSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(3).max(200).optional(),
  descripcion: z.string().min(10).optional(),
  requisitos: z.string().min(10).optional(),
  fecha_limite_postulacion: z.string().optional(),
  vacantes: z.number().int().min(1).optional(),
  estado: z.enum(['abierta', 'cerrada']).optional(),
});

const DeleteOfertaSchema = z.object({
  id: z.string().uuid(),
});

const CreatePostulacionSchema = z.object({
  oferta_id: z.string().uuid(),
  estudiante_id: z.string().uuid(),
  curriculum_url: z.string().url().optional(),
});

const UpdatePostulacionSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(['pendiente', 'aprobada', 'rechazada']),
});

const CreateAsignacionAsesorSchema = z.object({
  postulacion_id: z.string().uuid(),
  docente_id: z.string().uuid(),
});

const CreateRegistroHorasSchema = z.object({
  postulacion_id: z.string().uuid(),
  horas_trabajadas: z.number().int().min(1).max(24),
  descripcion_actividad: z.string().min(5),
  fecha: z.string().optional(),
});

const CreateInformeSchema = z.object({
  postulacion_id: z.string().uuid(),
  tipo: z.enum(['inicial', 'intermedio', 'final']),
  titulo: z.string().min(3),
  contenido: z.string().optional(),
  archivo_url: z.string().url().optional(),
});

const UpdateInformeSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(['pendiente', 'revisado', 'observado']),
  observaciones: z.string().optional(),
});

const ReactivarOfertaSchema = z.object({
  id: z.string().uuid(),
});

@Injectable()
export class InternshipsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly internshipsService: InternshipsService,
  ) {}

  public readonly router = this.trpcService.router({
    // Ofertas CRUD
    createOferta: this.trpcService.procedure
      .input(CreateOfertaSchema)
      .mutation(async ({ input }) => {
        // Conversión explícita de tipos
        const ofertaData = {
          empresa_id: input.empresa_id,
          titulo: input.titulo,
          descripcion: input.descripcion,
          requisitos: input.requisitos,
          fecha_limite_postulacion: input.fecha_limite_postulacion,
          vacantes: input.vacantes,
        };
        return this.internshipsService.createOferta(ofertaData);
      }),

    updateOferta: this.trpcService.procedure
      .input(UpdateOfertaSchema)
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return this.internshipsService.updateOferta(id, data);
      }),

    deleteOferta: this.trpcService.procedure
      .input(DeleteOfertaSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.deleteOferta(input.id);
      }),

    reactivarOferta: this.trpcService.procedure
      .input(ReactivarOfertaSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.reactivarOferta(input.id);
      }),

    getOfertas: this.trpcService.procedure
      .input(z.object({ estado: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return this.internshipsService.getOfertas(input?.estado);
      }),

    getOfertaById: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getOfertaById(input.id);
      }),

    // Postulaciones
    postular: this.trpcService.procedure
      .input(CreatePostulacionSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.postular(input);
      }),

    getPostulacionesByEstudiante: this.trpcService.procedure
      .input(z.object({ estudianteId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getPostulacionesByEstudiante(input.estudianteId);
      }),

    getPostulacionesByOferta: this.trpcService.procedure
      .input(z.object({ ofertaId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getPostulacionesByOferta(input.ofertaId);
      }),

    updatePostulacionEstado: this.trpcService.procedure
      .input(UpdatePostulacionSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.updatePostulacionEstado(input.id, input.estado);
      }),

    // Asignación de asesor
    asignarAsesor: this.trpcService.procedure
      .input(z.object({ 
        postulacionId: z.string().uuid(), 
        docenteId: z.string().uuid() 
      }))
      .mutation(async ({ input }) => {
        return this.internshipsService.asignarAsesor(input.postulacionId, input.docenteId);
      }),

    getAsesoresByPostulacion: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getAsesoresByPostulacion(input.postulacionId);
      }),

    // Horas
    registrarHoras: this.trpcService.procedure
      .input(CreateRegistroHorasSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.registrarHoras(input);
      }),

    getHorasByPostulacion: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getHorasByPostulacion(input.postulacionId);
      }),

    getTotalHoras: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getTotalHorasByPostulacion(input.postulacionId);
      }),

    // Informes
    crearInforme: this.trpcService.procedure
      .input(CreateInformeSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.crearInforme(input);
      }),

    getInformesByPostulacion: this.trpcService.procedure
      .input(z.object({ postulacionId: z.string().uuid() }))
      .query(async ({ input }) => {
        return this.internshipsService.getInformesByPostulacion(input.postulacionId);
      }),

    revisarInforme: this.trpcService.procedure
      .input(UpdateInformeSchema)
      .mutation(async ({ input }) => {
        return this.internshipsService.revisarInforme(input.id, input.estado, input.observaciones);
      }),

    // Estadísticas
    getEstadisticas: this.trpcService.procedure
      .query(async () => {
        return this.internshipsService.getEstadisticas();
      }),
  });
}