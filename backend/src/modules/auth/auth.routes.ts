import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { z } from 'zod';
import { AuthService } from './auth.service';

@Injectable()
export class AuthRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authService: AuthService,
  ) {}

  public readonly router = this.trpcService.router({
    // Login - usa correo y contrasena (coincide con el schema de BD)
    login: this.trpcService.procedure
      .input(
        z.object({
          correo: z.string().email('Correo electrónico inválido'),
          contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        }),
      )
      .mutation(async ({ input }) => {
        return this.authService.login(input);
      }),
    
    // Registro - campos actualizados según tu schema
    register: this.trpcService.procedure
      .input(
        z.object({
          correo: z.string().email(),
          contrasena: z.string().min(6),
          nombre_completo: z.string().min(3),
          rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'REPRESENTANTE_EMPRESA']),
          // Para ESTUDIANTE
          codigo_univ: z.string().optional(),
          carrera: z.string().optional(),
          ciclo: z.number().int().min(1).max(12).optional(),
          // Para DOCENTE
          especialidad: z.string().optional(),
          facultad: z.string().optional(),
          // Para REPRESENTANTE_EMPRESA
          empresa_id: z.string().uuid().optional(),
          cargo: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return this.authService.register(input);
      }),
    
    // Verificar token
    verifyToken: this.trpcService.procedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return this.authService.verifyToken(input.token);
      }),
  });
}