import { Injectable } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { AuthRouter } from '../modules/auth/auth.router';
import { InternshipsRouter } from '../modules/internships/internships.router';
import { CompaniesRouter } from '../modules/companies/companies.router';
import { CompanyRepRouter } from '../modules/company-rep/company-rep.router';
import { StudentsRouter } from '../modules/students/students.router';
import { RequestsRouter } from '../modules/requests/requests.router';
import { CarrerasRouter } from '../modules/carreras/carreras.router';
import { DashboardRouter } from '../modules/dashboard/dashboard.router';
import { UsersRouter } from '../modules/users/users.router';
import { ThesisRouter } from '../modules/thesis/thesis.router';
import { FacultadesRouter } from '../modules/facultades/facultades.router';
import { ProfileRouter } from '../modules/profile/profile.router';
import { AdminRouter } from '../modules/admin/admin.router';
import { CoordinatorRouter } from '../modules/coordinator/coordinator.router';
import { TeachersRouter } from '../modules/teachers/teachers.router';

@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly authRouter: AuthRouter,
    private readonly internshipsRouter: InternshipsRouter,
    private readonly companiesRouter: CompaniesRouter,
    private readonly companyRepRouter: CompanyRepRouter,
    private readonly studentsRouter: StudentsRouter,
    private readonly requestsRouter: RequestsRouter,
    private readonly carrerasRouter: CarrerasRouter,
    private readonly dashboardRouter: DashboardRouter,
    private readonly usersRouter: UsersRouter,
    private readonly thesisRouter: ThesisRouter,
    private readonly facultadesRouter: FacultadesRouter,
    private readonly profileRouter: ProfileRouter,
    private readonly adminRouter: AdminRouter,
    private readonly coordinatorRouter: CoordinatorRouter,
    private readonly teachersRouter: TeachersRouter,
  ) {}

  public readonly appRouter = this.trpcService.mergeRouters(
    this.trpcService.router({
      auth: this.authRouter.router,
    }),
    this.trpcService.router({
      internships: this.internshipsRouter.router,
    }),
    this.trpcService.router({
      companies: this.companiesRouter.router,
    }),
    this.trpcService.router({
      companyRep: this.companyRepRouter.router,
    }),
    this.trpcService.router({
      estudiantes: this.studentsRouter.router,
    }),
    this.trpcService.router({
      solicitudes: this.requestsRouter.router,
    }),
    this.trpcService.router({
      carreras: this.carrerasRouter.router,
    }),
    this.trpcService.router({
      dashboard: this.dashboardRouter.router,
    }),
    this.trpcService.router({
      users: this.usersRouter.router,
    }),
    this.trpcService.router({
      thesis: this.thesisRouter.router,
    }),
    this.trpcService.router({
      facultades: this.facultadesRouter.router,
    }),
    this.trpcService.router({
      profile: this.profileRouter.router,
    }),
    this.trpcService.router({
      admin: this.adminRouter.router,
    }),
    this.trpcService.router({
      coordinator: this.coordinatorRouter.router,
    }),
    this.trpcService.router({
      teacher: this.teachersRouter.router,
    }),
  );
}

export type AppRouter = TrpcRouter['appRouter'];