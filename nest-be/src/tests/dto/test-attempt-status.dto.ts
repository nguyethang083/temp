import { IsString, IsIn } from 'class-validator';

// Define the possible statuses explicitly
export type AttemptStatus = 'not_started' | 'in_progress' | 'completed';

export class TestAttemptStatusDto {
  @IsString()
  @IsIn(['not_started', 'in_progress', 'completed']) // Validate the value
  status: AttemptStatus;
}
