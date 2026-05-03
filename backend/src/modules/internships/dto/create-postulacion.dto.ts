import { z } from 'zod';

export const CreatePostulacionSchema = z.object({
  oferta_id: z.string().uuid(),
  estudiante_id: z.string().uuid(),
  curriculum_url: z.string().url().optional(),
});

export type CreatePostulacionDto = z.infer<typeof CreatePostulacionSchema>;