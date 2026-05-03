import { Module, forwardRef } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardRouter } from './dashboard.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [DashboardService, DashboardRouter, PrismaService],
  exports: [DashboardService, DashboardRouter],
})
export class DashboardModule {}