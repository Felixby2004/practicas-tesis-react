import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
});

export const ChangePasswordSchema = z.object({
  contrasena_actual: z.string().min(6, 'La contraseña actual es requerida'),
  contrasena_nueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;