import { z } from 'zod';

export const CreateSolicitudSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rol_solicitado: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']),
  // Para estudiante
  carrera_id: z.string().uuid().optional(),
  ciclo: z.number().int().min(1).max(12).optional(),
  // Para docente
  especialidad: z.string().optional(),
  facultad_id: z.string().uuid().optional(),
  // Para representante
  empresa_id: z.string().uuid().optional(),
  cargo: z.string().optional(),
});

export const UpdateSolicitudSchema = z.object({
  estado: z.enum(['pendiente', 'aprobado', 'rechazado']),
  observaciones: z.string().optional(),
});

export type CreateSolicitudDto = z.infer<typeof CreateSolicitudSchema>;
export type UpdateSolicitudDto = z.infer<typeof UpdateSolicitudSchema>;