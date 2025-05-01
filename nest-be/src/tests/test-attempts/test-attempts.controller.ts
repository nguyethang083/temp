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
  Patch,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { JwtGuard } from '../../auth/guards/auth.guard';
import {
  AttemptResultDetails,
  TestAttemptsService,
  UserAttempt,
} from './test-attempts.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import {
  AnswerDto,
  SubmitTestAttemptDto,
} from '../dto/submit-test-attempt.dto';
import { SaveProgressDto } from '../dto/save-progress.dto';

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

  @Patch(':attemptId/save-progress')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async saveAttemptProgress(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() progressData: SaveProgressDto, // Use the validated DTO
    @GetUser() user: User,
  ) {
    this.logger.log(
      `Received request to SAVE PROGRESS for attempt ID: ${attemptId} by user ID: ${user?.id}`,
    );
    this.logger.debug(`Save progress data: ${JSON.stringify(progressData)}`);

    if (!user) {
      this.logger.error(
        'User object not found in request during save progress.',
      );
      throw new InternalServerErrorException('User authentication failed.');
    }

    // Call the service method
    return this.testAttemptsService.saveAttemptProgress(
      attemptId,
      progressData,
      user,
    );
  }

  @Get(':attemptId/result')
  async getAttemptResult(
    @Param('attemptId', ParseUUIDPipe) attemptId: string, // Validate UUID format
    @GetUser() user: User, // Get the authenticated user
  ): Promise<AttemptResultDetails> {
    // Define return type
    this.logger.log(
      `Received request for result details for attempt ID: ${attemptId} by user ID: ${user?.id}`,
    );
    return this.testAttemptsService.getAttemptResultDetails(attemptId, user);
  }
}
