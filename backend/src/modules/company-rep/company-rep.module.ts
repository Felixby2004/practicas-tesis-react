import { Module, forwardRef } from '@nestjs/common';
import { CompanyRepService } from './company-rep.service';
import { CompanyRepRouter } from './company-rep.router';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  imports: [forwardRef(() => TrpcModule)],
  providers: [CompanyRepService, CompanyRepRouter],
  exports: [CompanyRepService, CompanyRepRouter],
})
export class CompanyRepModule {}
