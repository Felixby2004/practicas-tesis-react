import { Module, forwardRef } from '@nestjs/common';
import { CarrerasService } from './carreras.service';
import { CarrerasRouter } from './carreras.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [CarrerasService, CarrerasRouter, PrismaService],
  exports: [CarrerasService, CarrerasRouter],
})
export class CarrerasModule {}