import { Module, forwardRef } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { AuthModule } from '../modules/auth/auth.module';
import { InternshipsModule } from '../modules/internships/internships.module';
import { CompaniesModule } from '../modules/companies/companies.module';
import { CompanyRepModule } from '../modules/company-rep/company-rep.module';
import { StudentsModule } from '../modules/students/students.module';
import { RequestsModule } from '../modules/requests/requests.module';
import { CarrerasModule } from '../modules/carreras/carreras.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { UsersModule } from '../modules/users/users.module';
import { ThesisModule } from '../modules/thesis/thesis.module';
import { FacultadesModule } from '../modules/facultades/facultades.module';
import { ProfileModule } from '../modules/profile/profile.module';
import { AdminModule } from '../modules/admin/admin.module';
import { CoordinatorModule } from '../modules/coordinator/coordinator.module';
import { TeachersModule } from '../modules/teachers/teachers.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => InternshipsModule),
    forwardRef(() => CompaniesModule),
    forwardRef(() => CompanyRepModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => RequestsModule),
    forwardRef(() => CarrerasModule),
    forwardRef(() => DashboardModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ThesisModule),
    forwardRef(() => FacultadesModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => AdminModule),
    forwardRef(() => CoordinatorModule),
    forwardRef(() => TeachersModule),
  ],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {}