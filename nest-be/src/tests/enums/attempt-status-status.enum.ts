export enum AttemptStatusEnum {
  InProgress = 'in_progress',
  Completed = 'completed', // Submitted, potentially needs manual grading
  TimedOut = 'timed_out', // Timer ran out before submission
  Graded = 'graded', // Fully graded (auto or manual)
}
