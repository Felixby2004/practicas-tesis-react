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
    // Login - público
    login: this.trpcService.procedure
      .input(
        z.object({
          correo: z.string().email('Correo electrónico inválido'),
          contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        }),
      )
      .mutation(async ({ input }) => {
        // Hacer una conversión de tipos explícita aquí
        const loginData: { correo: string; contrasena: string } = {
          correo: input.correo,
          contrasena: input.contrasena,
        };
        return this.authService.login(loginData);
      }),

    // Registro - público
    register: this.trpcService.procedure
      .input(
        z.object({
          correo: z.string().email(),
          contrasena: z.string().min(6),
          nombre_completo: z.string().min(3),
          rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'REPRESENTANTE_EMPRESA']),
          codigo_univ: z.string().optional(),
          carrera: z.string().optional(),
          ciclo: z.number().int().min(1).max(12).optional(),
          especialidad: z.string().optional(),
          facultad: z.string().optional(),
          empresa_id: z.string().uuid().optional(),
          cargo: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        return this.authService.register(input);
      }),

    // Verificar token - público
    verifyToken: this.trpcService.procedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return this.authService.verifyToken(input.token);
      }),
  });
}