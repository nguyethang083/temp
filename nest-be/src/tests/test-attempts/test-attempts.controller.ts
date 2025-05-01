import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
  Req,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtGuard } from '../../auth/guards/auth.guard';
import { TestAttemptsService, UserAttempt } from './test-attempts.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import {
  AnswerDto,
  SubmitTestAttemptDto,
} from '../dto/submit-test-attempt.dto';

@UseGuards(JwtGuard)
@Controller('test-attempts')
export class TestAttemptsController {
  private readonly logger = new Logger(TestAttemptsController.name);

  constructor(private readonly testAttemptsService: TestAttemptsService) {}

  @Post(':attemptId/submit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Apply the pipe!
  async submitTestAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() submissionData: SubmitTestAttemptDto, // Use the validated DTO directly
    @GetUser() user: User,
  ) {
    this.logger.log(
      `Received VALIDATED submission for attempt ID: ${attemptId} by user ID: ${user?.id}`,
    );
    this.logger.log(
      // Log the validated/transformed data
      `Validated submission data: ${JSON.stringify(submissionData, null, 2)}`,
    );

    if (!user) {
      this.logger.error('User object not found in request during submission.');
      // Guard should prevent this, but double-check
      throw new InternalServerErrorException('User authentication failed.');
    }
    // Call the refactored service method
    return this.testAttemptsService.submitTestAttempt(
      attemptId,
      submissionData,
      user,
    );
  }

  @Get('test/:testId') // Route: GET /test-attempts/test/{testId}
  async getUserAttemptsForTest(
    @Param('testId', ParseUUIDPipe) testId: string, // Get testId from URL
    @GetUser() user: User, // Get authenticated user
  ): Promise<UserAttempt[]> {
    // Define return type
    this.logger.log(
      `Request received for previous attempts for test ID: ${testId} by user ID: ${user?.id}`,
    );

    if (!user) {
      this.logger.error('User object not found in request.');
      throw new InternalServerErrorException('User authentication failed.');
    }

    // Call the service method
    const attempts = await this.testAttemptsService.getUserAttemptsForTest(
      testId,
      user,
    );
    return attempts;
  }

  // TODO: Add POST /test-attempts/:attemptId/save-progress endpoint here later
}
