import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { TestAttemptsController } from './test-attempts/test-attempts.controller';
import { TestAttemptsService } from './test-attempts/test-attempts.service';

@Module({
  imports: [SupabaseModule],
  controllers: [TestsController, TestAttemptsController],
  providers: [TestsService, TestAttemptsService],
})
export class TestsModule {}
