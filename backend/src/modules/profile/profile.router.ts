import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { ProfileService } from './profile.service';
import { UpdateProfileSchema, ChangePasswordSchema } from './dto/profile.dto';

@Injectable()
export class ProfileRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly profileService: ProfileService,
  ) {}

  public readonly router = this.trpcService.router({
    getPerfil: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.profileService.getPerfil(ctx.user.id);
      }),

    updatePerfil: this.trpcService.procedure
      .input(UpdateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.profileService.updatePerfil(ctx.user.id, input);
      }),

    changePassword: this.trpcService.procedure
      .input(ChangePasswordSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.profileService.changePassword(ctx.user.id, input);
      }),

    getEstadisticas: this.trpcService.procedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          throw new Error('No autenticado');
        }
        return this.profileService.getEstadisticas(ctx.user.id, ctx.user.rol || '');
      }),
  });
}