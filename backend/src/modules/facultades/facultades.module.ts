import { Module, forwardRef } from '@nestjs/common';
import { FacultadesRouter } from './facultades.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [FacultadesRouter, PrismaService],
  exports: [FacultadesRouter],
})
export class FacultadesModule {}