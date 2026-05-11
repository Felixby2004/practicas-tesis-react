import { Module, forwardRef } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileRouter } from './profile.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [ProfileService, ProfileRouter, PrismaService],
  exports: [ProfileService, ProfileRouter],
})
export class ProfileModule {}