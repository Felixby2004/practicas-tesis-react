import { z } from 'zod';

export const CreateEstudianteSchema = z.object({
  usuario_id: z.string().uuid(),
  codigo_univ: z.string().min(5).max(20),
  carrera_id: z.string().uuid(),
  ciclo: z.number().int().min(1).max(12),
  expediente_url: z.string().url().optional(),  // 👈 Cambiado
});

export const UpdateEstudianteSchema = z.object({
  codigo_univ: z.string().min(5).max(20).optional(),
  carrera_id: z.string().uuid().optional(),
  ciclo: z.number().int().min(1).max(12).optional(),
  expediente_url: z.string().url().optional(),  // 👈 Cambiado
});

export type CreateEstudianteDto = z.infer<typeof CreateEstudianteSchema>;
export type UpdateEstudianteDto = z.infer<typeof UpdateEstudianteSchema>;