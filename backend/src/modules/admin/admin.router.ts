import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { AdminService } from './admin.service';
import {
  CreateEstudianteSchema,
  CreateDocenteSchema,
  CreateCoordinadorSchema,
  CreateRepresentanteSchema,
} from './dto/create-user.dto';

@Injectable()
export class AdminRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly adminService: AdminService,
  ) {}

  public readonly router = this.trpcService.router({
    createEstudiante: this.trpcService.procedure
      .input(CreateEstudianteSchema)
      .mutation(async ({ input }) => {
        return this.adminService.createEstudiante(input);
      }),

    createDocente: this.trpcService.procedure
      .input(CreateDocenteSchema)
      .mutation(async ({ input }) => {
        return this.adminService.createDocente(input);
      }),

    createCoordinador: this.trpcService.procedure
      .input(CreateCoordinadorSchema)
      .mutation(async ({ input }) => {
        return this.adminService.createCoordinador(input);
      }),

    createRepresentante: this.trpcService.procedure
      .input(CreateRepresentanteSchema)
      .mutation(async ({ input }) => {
        return this.adminService.createRepresentante(input);
      }),

    getDataForForms: this.trpcService.procedure
      .query(async () => {
        return this.adminService.getDataForForms();
      }),
  });
}