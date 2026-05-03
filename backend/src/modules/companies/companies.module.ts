import { Module, forwardRef } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesRouter } from './companies.router';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [CompaniesService, CompaniesRouter],
  exports: [CompaniesService, CompaniesRouter],
})
export class CompaniesModule {}
