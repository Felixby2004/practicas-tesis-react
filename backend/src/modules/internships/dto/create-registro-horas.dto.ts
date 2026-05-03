import { z } from 'zod';

export const CreateRegistroHorasSchema = z.object({
  postulacion_id: z.string().uuid(),
  horas_trabajadas: z.number().int().min(1).max(24),
  descripcion_actividad: z.string().min(5),
  fecha: z.string().datetime().optional(),
});

export type CreateRegistroHorasDto = z.infer<typeof CreateRegistroHorasSchema>;