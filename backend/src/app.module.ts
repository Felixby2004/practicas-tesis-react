import { Module } from '@nestjs/common';
import { TrpcModule } from './trpc/trpc.module';
import { AuthModule } from './modules/auth/auth.module';
import { InternshipsModule } from './modules/internships/internships.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { StudentsModule } from './modules/students/students.module';
import { RequestsModule } from './modules/requests/requests.module';
import { CarrerasModule } from './modules/carreras/carreras.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { ThesisModule } from './modules/thesis/thesis.module';  // 👈 Agregar
import { FacultadesModule } from './modules/facultades/facultades.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    TrpcModule,
    AuthModule,
    InternshipsModule,
    CompaniesModule,
    StudentsModule,
    RequestsModule,
    CarrerasModule,
    DashboardModule,
    UsersModule,
    ThesisModule,  // 👈 Agregar
    FacultadesModule,
  ],
})
export class AppModule {}