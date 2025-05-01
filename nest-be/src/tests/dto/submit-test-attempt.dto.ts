import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  IsEnum,
  IsInt,
  IsUUID,
} from 'class-validator';

// Define the enum for question types
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  ESSAY = 'essay',
  SELF_WRITE = 'self_write',
}

export class AnswerDto {
  @IsNotEmpty()
  @IsEnum(QuestionType) // Validate that question_type is one of the enum values
  question_type: QuestionType;

  @IsOptional()
  @IsString()
  userAnswer?: string | null;

  @IsOptional()
  @IsString()
  shortAnswer?: string | null;

  @IsOptional()
  @IsString()
  longAnswer?: string | null;

  @IsOptional()
  @IsString()
  drawing?: string | null;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isMarked?: boolean;

  @IsInt()
  @IsNotEmpty()
  timeSpent?: number | null;
}

export class SubmitTestAttemptDto {
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null) {
      const result = {};
      Object.keys(value).forEach((key) => {
        result[key] = value[key];
      });
      return result;
    }
    return {};
  })
  answers: Record<string, AnswerDto>;

  @IsNumber()
  @Min(0)
  timeLeft: number;

  @IsUUID()
  @IsNotEmpty()
  lastViewedTestQuestionId?: string | null;
}
