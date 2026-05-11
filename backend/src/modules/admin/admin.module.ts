import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRouter } from './admin.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [AdminService, AdminRouter, PrismaService, EmailService],
  exports: [AdminService, AdminRouter],
})
export class AdminModule {}