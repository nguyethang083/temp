import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';

class AnswerDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  mcAnswer?: string | null;

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
}

export class SubmitTestAttemptDto {
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: Record<string, AnswerDto>;

  @IsNumber()
  @Min(0)
  timeLeft: number;
}
