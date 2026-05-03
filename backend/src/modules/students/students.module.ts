import { Module, forwardRef } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsRouter } from './students.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [StudentsService, StudentsRouter, PrismaService],
  exports: [StudentsService, StudentsRouter],
})
export class StudentsModule {}