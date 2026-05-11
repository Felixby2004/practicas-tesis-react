import { z } from 'zod';

// Esquema base para crear usuario
export const CreateUserBaseSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']),
});

// Esquema para estudiante
export const CreateEstudianteSchema = CreateUserBaseSchema.extend({
  rol: z.literal('ESTUDIANTE'),
  codigo_univ: z.string().min(5),
  carrera_id: z.string().uuid(),
  ciclo: z.number().int().min(1).max(12),
  expediente_url: z.string().url().optional(),
});

// Esquema para docente
export const CreateDocenteSchema = CreateUserBaseSchema.extend({
  rol: z.literal('DOCENTE'),
  especialidad: z.string(),
  facultad_id: z.string().uuid(),
});

// Esquema para coordinador
export const CreateCoordinadorSchema = CreateUserBaseSchema.extend({
  rol: z.literal('COORDINADOR'),
  facultad_id: z.string().uuid(),
});

// Esquema para representante de empresa
export const CreateRepresentanteSchema = CreateUserBaseSchema.extend({
  rol: z.literal('REPRESENTANTE_EMPRESA'),
  empresa_id: z.string().uuid(),
  cargo: z.string(),
});

export type CreateEstudianteDto = z.infer<typeof CreateEstudianteSchema>;
export type CreateDocenteDto = z.infer<typeof CreateDocenteSchema>;
export type CreateCoordinadorDto = z.infer<typeof CreateCoordinadorSchema>;
export type CreateRepresentanteDto = z.infer<typeof CreateRepresentanteSchema>;