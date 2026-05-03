import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRouter } from './users.router';
import { PrismaService } from '../../prisma/prisma.service';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [UsersService, UsersRouter, PrismaService],
  exports: [UsersService, UsersRouter],
})
export class UsersModule {}