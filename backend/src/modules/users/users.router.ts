import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { UsersService } from './users.service';
import { z } from 'zod';

@Injectable()
export class UsersRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly usersService: UsersService,
  ) {}

  public readonly router = this.trpcService.router({
    // Procedimiento de prueba
    ping: this.trpcService.procedure
      .query(() => {
        console.log('🏓 Pong desde users router!');
        return { message: 'pong', timestamp: new Date().toISOString() };
      }),

    getUsuariosByRol: this.trpcService.procedure
      .input(z.object({ rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']) }))
      .query(async ({ input }) => {
        console.log('📊 getUsuariosByRol llamado:', input.rol);
        const result = await this.usersService.findByRol(input.rol);
        console.log('✅ Resultado:', result?.length || 0, 'usuarios');
        return result;
      }),

    getEstadisticasByRol: this.trpcService.procedure
      .input(z.object({ rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']) }))
      .query(async ({ input }) => {
        console.log('📊 getEstadisticasByRol llamado:', input.rol);
        const result = await this.usersService.getEstadisticasByRol(input.rol);
        console.log('✅ Estadísticas:', result);
        return result;
      }),

    getUsuarioDetalle: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']) }))
      .query(async ({ input }) => {
        return this.usersService.getDetalleByRol(input.id, input.rol);
      }),

    updateUsuario: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']), data: z.any() }))
      .mutation(async ({ input }) => {
        return this.usersService.updateByRol(input.id, input.rol, input.data);
      }),

    deleteUsuario: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']) }))
      .mutation(async ({ input }) => {
        return this.usersService.deleteByRol(input.id, input.rol);
      }),

    reactivarUsuario: this.trpcService.procedure
      .input(z.object({ id: z.string().uuid(), rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'REPRESENTANTE_EMPRESA']) }))
      .mutation(async ({ input }) => {
        return this.usersService.reactivarByRol(input.id, input.rol);
      }),
  });
}