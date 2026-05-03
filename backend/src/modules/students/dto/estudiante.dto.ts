import { z } from 'zod';

export const CreateEstudianteSchema = z.object({
  usuario_id: z.string().uuid(),
  codigo_univ: z.string().min(5).max(20),
  carrera_id: z.string().uuid(),  // 👈 Cambiar a carrera_id
  ciclo: z.number().int().min(1).max(12),
  expediente: z.string().url().optional(),
});

export const UpdateEstudianteSchema = z.object({
  codigo_univ: z.string().min(5).max(20).optional(),
  carrera_id: z.string().uuid().optional(),  // 👈 Cambiar a carrera_id
  ciclo: z.number().int().min(1).max(12).optional(),
  expediente: z.string().url().optional(),
});

export type CreateEstudianteDto = z.infer<typeof CreateEstudianteSchema>;
export type UpdateEstudianteDto = z.infer<typeof UpdateEstudianteSchema>;