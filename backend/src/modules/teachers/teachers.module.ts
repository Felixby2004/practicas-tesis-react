import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TeacherService } from './teachers.service';
import { TeachersRouter } from './teachers.router';
import { TrpcModule } from '../../trpc/trpc.module'; // Importa TrpcModule

@Module({
  imports: [forwardRef(() => TrpcModule)], // Usa forwardRef por la referencia circular
  providers: [PrismaService, TeacherService, TeachersRouter],
  exports: [TeacherService, TeachersRouter],
})
export class TeachersModule {}