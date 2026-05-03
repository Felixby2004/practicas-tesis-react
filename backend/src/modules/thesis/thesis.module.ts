import { Module, forwardRef } from '@nestjs/common';
import { ThesisService } from './thesis.service';
import { ThesisRouter } from './thesis.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [ThesisService, ThesisRouter, PrismaService],
  exports: [ThesisService, ThesisRouter],
})
export class ThesisModule {}