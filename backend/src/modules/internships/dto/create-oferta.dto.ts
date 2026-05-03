import { z } from 'zod';

export const CreateOfertaSchema = z.object({
  empresa_id: z.string().uuid(),
  titulo: z.string().min(3).max(200),
  descripcion: z.string().min(10),
  requisitos: z.string().min(10),
  fecha_limite_postulacion: z.string().datetime(),
  vacantes: z.number().int().min(1),
});

export type CreateOfertaDto = z.infer<typeof CreateOfertaSchema>;