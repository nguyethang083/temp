import { Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
  Allow,
} from 'class-validator';

// DTO defining the VALUE part of the answers map
class ProgressAnswerDto {
  @Allow() // Allows any value basically
  @IsOptional()
  userAnswer?: any | null;

  @IsInt()
  @IsOptional()
  timeSpent: number;
}

export class SaveProgressDto {
  @IsUUID()
  @IsOptional()
  lastViewedTestQuestionId?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  remainingTimeSeconds?: number | null;

  // Use this approach instead of ValidateNested
  @IsObject()
  @IsOptional()
  @Type(() => Object)
  answers?: Record<string, any>;
}
