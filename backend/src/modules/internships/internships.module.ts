import { Module, forwardRef } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { InternshipsRouter } from './internships.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [forwardRef(() => TrpcModule)], // Usa forwardRef
  providers: [InternshipsService, InternshipsRouter, PrismaService, EmailService],
  exports: [InternshipsService, InternshipsRouter],
})
export class InternshipsModule {}