import { z } from 'zod';

export const CreateEmpresaSchema = z.object({
  razon_social: z.string().min(3, 'La razón social debe tener al menos 3 caracteres'),
  ruc: z.string().length(11, 'El RUC debe tener 11 dígitos'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo_contacto: z.string().email('Debe ser un email válido'),
});

export const UpdateEmpresaSchema = z.object({
  razon_social: z.string().min(3).optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo_contacto: z.string().email().optional(),
});

export const CreateConvenioSchema = z.object({
  empresa_id: z.string().uuid(),
  tipo: z.enum(['Marco', 'Especifico']),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  archivo_url: z.string().url('Debe ser una URL válida').optional().nullable(),
});

export type CreateEmpresaDto = z.infer<typeof CreateEmpresaSchema>;
export type UpdateEmpresaDto = z.infer<typeof UpdateEmpresaSchema>;
export type CreateConvenioDto = z.infer<typeof CreateConvenioSchema>;