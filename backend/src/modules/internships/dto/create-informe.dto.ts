import { z } from 'zod';

export const CreateInformeSchema = z.object({
  postulacion_id: z.string().uuid(),
  tipo: z.enum(['inicial', 'intermedio', 'final']),
  titulo: z.string().min(3),
  contenido: z.string().optional(),
  archivo_url: z.string().url().optional(),
});

export type CreateInformeDto = z.infer<typeof CreateInformeSchema>;