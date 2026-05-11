import { Module, forwardRef } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { CoordinatorRouter } from './coordinator.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [CoordinatorService, CoordinatorRouter, PrismaService, EmailService],
  exports: [CoordinatorService, CoordinatorRouter],
})
export class CoordinatorModule {}