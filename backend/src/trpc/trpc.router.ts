import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from '../modules/auth/auth.router';
import { InternshipsRouter } from '../modules/internships/internships.router';
import { CompaniesRouter } from '../modules/companies/companies.router';
import { StudentsRouter } from '../modules/students/students.router';
import { RequestsRouter } from '../modules/requests/requests.router';
import { CarrerasRouter } from '../modules/carreras/carreras.router';
import { DashboardRouter } from '../modules/dashboard/dashboard.router';
import { UsersRouter } from '../modules/users/users.router';
import { ThesisRouter } from '../modules/thesis/thesis.router';  // 👈 Agregar
import { FacultadesRouter } from '../modules/facultades/facultades.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly internshipsRouter: InternshipsRouter,
    private readonly companiesRouter: CompaniesRouter,
    private readonly studentsRouter: StudentsRouter,
    private readonly requestsRouter: RequestsRouter,
    private readonly carrerasRouter: CarrerasRouter,
    private readonly dashboardRouter: DashboardRouter,
    private readonly usersRouter: UsersRouter,
    private readonly thesisRouter: ThesisRouter,  // 👈 Agregar
    private readonly facultadesRouter: FacultadesRouter,
  ) {}

  public readonly appRouter = this.trpcService.router({
    auth: this.authRouter.router,
    internships: this.internshipsRouter.router,
    companies: this.companiesRouter.router,
    estudiantes: this.studentsRouter.router,
    solicitudes: this.requestsRouter.router,
    carreras: this.carrerasRouter.router,
    dashboard: this.dashboardRouter.router,
    users: this.usersRouter.router,
    thesis: this.thesisRouter.router,  // 👈 Agregar
    facultades: this.facultadesRouter.router,
  });
}