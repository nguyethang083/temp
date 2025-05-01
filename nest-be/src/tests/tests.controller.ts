import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Logger,
  UseGuards,
  Post,
  InternalServerErrorException,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { FindAllTestsQueryDto } from './dto/find-all-tests-query.dto';
import { JwtGuard } from '../auth/guards/auth.guard';
import { TestAttemptsService } from './test-attempts/test-attempts.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@supabase/supabase-js';
import { TestAttemptStatusDto } from './dto/test-attempt-status.dto';

@UseGuards(JwtGuard)
@Controller('tests')
export class TestsController {
  private readonly logger = new Logger(TestsController.name);

  constructor(
    private readonly testsService: TestsService,
    private readonly testAttemptsService: TestAttemptsService,
  ) {}

  @Get()
  async findAllActive(@Query() queryDto: FindAllTestsQueryDto) {
    this.logger.log(
      `Received request for active tests list with query: ${JSON.stringify(queryDto)}`,
    );
    return this.testsService.findAllActive(queryDto);
  }

  @Get(':id')
  async findOneDetails(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(
      `Received request for test details (metadata only) with ID: ${id}`,
    );
    return this.testsService.findOneDetails(id);
  }

  @Get(':id/data-for-taking')
  async getTestDataForTaking(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(
      `Received request to get test data for taking UI with ID: ${id}`,
    );
    return this.testsService.getTestDataForTaking(id);
  }

  @UseGuards(JwtGuard)
  @Post(':testId/attempts/start')
  async startOrResumeTestAttempt(
    @Param('testId', ParseUUIDPipe) testId: string,
    @GetUser() user: User,
  ) {
    this.logger.log(
      `Received request to start/resume attempt for test ID: ${testId} by user ID: ${user?.id}`,
    );
    if (!user) {
      this.logger.error('User object not found in request despite AuthGuard.');
      throw new InternalServerErrorException('User authentication failed.');
    }
    return this.testAttemptsService.startOrResumeAttempt(testId, user);
  }
  @Get(':id/status')
  async getTestAttemptStatus(
    // Use ParseUUIDPipe if your test IDs are UUIDs to validate format
    @Param('id' /*, ParseUUIDPipe */) testId: string,
    @Request() req, // Get the whole request object to access the user
  ): Promise<TestAttemptStatusDto> {
    // Extract user ID from the request object (adjust property based on your JWT strategy)
    const userId = req.user?.id || req.user?.sub; // Common properties for user ID

    if (!userId) {
      // This shouldn't happen if JwtAuthGuard is working correctly, but good practice to check
      this.logger.error('User ID not found in request after AuthGuard.');
      throw new InternalServerErrorException('Could not identify user.');
    }

    this.logger.log(
      `Request received for attempt status: testId=${testId}, userId=${userId}`,
    );

    try {
      // Call the service method
      const statusResult = await this.testsService.getTestAttemptStatus(
        testId,
        userId,
      );
      return statusResult;
    } catch (error) {
      // Log the error details
      this.logger.error(
        `Error in getTestAttemptStatus controller for test ${testId}: ${error.message}`,
        error.stack,
      );

      // Re-throw specific known errors or a generic one
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message); // Propagate NotFound
      }
      // Add other specific error types if needed
      // if (error instanceof SomeOtherError) { ... }

      // Throw generic error for unknown issues
      throw new InternalServerErrorException(
        'An error occurred while fetching the test status.',
      );
    }
  }
}
