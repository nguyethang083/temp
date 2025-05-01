import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Logger,
  ValidationPipe,
  UsePipes,
  ForbiddenException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@supabase/supabase-js';
import { AnswerDto, SubmitTestAttemptDto } from './dto/submit-test-attempt.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@UseGuards(JwtGuard)
@Controller('test-attempts')
export class TestAttemptsController {
  private readonly logger = new Logger(TestAttemptsController.name);

  constructor(private readonly testsService: TestsService) {}

  @Post(':id/attempts')
  async createTestAttempt(
    @Param('id', ParseUUIDPipe) testId: string,
    @GetUser() user: User,
  ) {
    this.logger.log(
      `Received request to create test attempt for test ID: ${testId} by user ID: ${user?.id}`,
    );
    if (!user) {
      this.logger.error('User object not found in request despite AuthGuard.');
      throw new InternalServerErrorException('User authentication failed.');
    }
    return this.testsService.createTestAttempt(testId, user);
  }

  @Post(':attemptId/submit')
  async submitTestAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() rawSubmissionData: any,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Received submission for attempt ID: ${attemptId} by user ID: ${user?.id}`,
    );

    this.logger.log(
      `Raw submission data: ${JSON.stringify(rawSubmissionData, null, 2)}`,
    );

    // Manually transform and validate the data
    const submissionData =
      await this.transformAndValidateSubmission(rawSubmissionData);

    this.logger.log(
      `Parsed submission data: ${JSON.stringify(submissionData, null, 2)}`,
    );

    if (!user) {
      this.logger.error('User object not found in request during submission.');
      throw new ForbiddenException('User authentication failed.');
    }

    return this.testsService.submitTestAttempt(attemptId, submissionData, user);
  }

  private async transformAndValidateSubmission(
    rawData: any,
  ): Promise<SubmitTestAttemptDto> {
    // Create a properly structured object
    const transformedData: SubmitTestAttemptDto = {
      answers: {},
      timeLeft: rawData.timeLeft,
    };

    // Process each answer
    if (rawData.answers && typeof rawData.answers === 'object') {
      for (const [questionId, answerData] of Object.entries(rawData.answers)) {
        // Transform the answer to an AnswerDto instance
        const answer = plainToInstance(AnswerDto, answerData);

        // Validate the answer
        const errors = await validate(answer);
        if (errors.length === 0) {
          transformedData.answers[questionId] = answer;
        } else {
          this.logger.warn(
            `Validation errors for answer ${questionId}: ${JSON.stringify(errors)}`,
          );
          // Still add it to the collection, but the service might need to handle invalid answers
          transformedData.answers[questionId] = answer;
        }
      }
    }

    return transformedData;
  }
  // TODO: Add POST /test-attempts/:attemptId/save-progress endpoint here later
}
