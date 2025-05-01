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
import { SubmitTestAttemptDto } from './dto/submit-test-attempt.dto';

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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async submitTestAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() submissionData: SubmitTestAttemptDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Received submission for attempt ID: ${attemptId} by user ID: ${user?.id}`,
    );
    this.logger.log(
      `Raw submission data: ${JSON.stringify(req.body, null, 2)}`,
    ); // Log raw submission data
    this.logger.log(
      `Parsed submission data: ${JSON.stringify(submissionData, null, 2)}`,
    ); // Log parsed submission data

    if (!user) {
      this.logger.error('User object not found in request during submission.');
      throw new ForbiddenException('User authentication failed.');
    }
    return this.testsService.submitTestAttempt(attemptId, submissionData, user);
  }

  // TODO: Add POST /test-attempts/:attemptId/save-progress endpoint here later
}
