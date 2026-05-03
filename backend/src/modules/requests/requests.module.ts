import { Module, forwardRef } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsRouter } from './requests.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [RequestsService, RequestsRouter, PrismaService],
  exports: [RequestsService, RequestsRouter],
})
export class RequestsModule {}