import { IsOptional, IsString, IsUUID, IsEnum, IsInt } from 'class-validator';

export enum TestTypeEnum {
  Exam = 'Exam',
  Practice = 'Practice',
  Assessment = 'Assessment',
}

export class FindAllTestsQueryDto {
  @IsOptional()
  // @IsInt()
  topicId?: string;

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsEnum(TestTypeEnum) // Validate against the enum
  testType?: TestTypeEnum;

  // Add other potential query parameters here (e.g., difficulty)
  // @IsOptional()
  // @IsString()
  // difficulty?: string;
}
