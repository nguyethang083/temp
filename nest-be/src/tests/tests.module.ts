import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { TestAttemptsController } from './test-attempts.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [TestsController, TestAttemptsController],
  providers: [TestsService],
})
export class TestsModule {}
