import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { User } from '@supabase/supabase-js';
import { SubmitTestAttemptDto } from '../dto/submit-test-attempt.dto';

@Injectable()
export class TestAttemptsService {
  private readonly logger = new Logger(TestAttemptsService.name);
  private supabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabaseClient = this.supabaseService.getClient();
    this.logger.log('TestsService Initialized. Supabase client obtained.');
  }

  /**
   * Starts a new test attempt or resumes an existing 'in_progress' one
   * by calling the Supabase RPC function `start_or_resume_test_attempt`.
   *
   * @param {string} testId - The UUID of the test.
   * @param {User} user - The authenticated Supabase user object.
   * @returns {Promise<any>} JSON object containing attempt, test, questions, and saved answers.
   * @throws {HttpException} If the RPC call fails or returns an error.
   */
  async startOrResumeAttempt(testId: string, user: User): Promise<any> {
    this.logger.log(
      `Calling RPC start_or_resume_test_attempt for test ID: ${testId}, User ID: ${user.id}`,
    );
    if (!this.supabaseClient)
      throw new InternalServerErrorException('Supabase client not available.');
    if (!user || !user.id)
      throw new InternalServerErrorException('User information is missing.');

    try {
      const { data, error } = await this.supabaseClient.rpc(
        'start_or_resume_test_attempt',
        {
          input_test_id: testId,
          input_user_id: user.id,
        },
      );

      if (error) {
        this.logger.error(
          `RPC call start_or_resume_test_attempt failed for test ${testId}, user ${user.id}: ${error.message}`,
          error.details, // Often contains more info like the SQLERRM
        );
        // Map common DB errors to HTTP statuses
        if (error.message.includes('TestNotFound')) {
          throw new NotFoundException(`Test with ID ${testId} not found.`);
        }
        if (error.message.includes('TestInactive')) {
          throw new ForbiddenException(`Test with ID ${testId} is not active.`);
        }
        // Default internal server error
        throw new InternalServerErrorException(
          `Failed to start or resume test: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully executed start_or_resume_test_attempt for test ${testId}, attempt ID: ${data?.attempt?.id}`,
      );
      return data; // This is the JSONB response from the function
    } catch (error) {
      this.logger.error(
        `Unexpected error calling RPC start_or_resume_test_attempt for test ${testId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) throw error; // Re-throw known HTTP exceptions
      throw new InternalServerErrorException(
        'An unexpected error occurred while starting the test.',
      );
    }
  }

  /**
   * Submits a test attempt by calling the Supabase RPC function `submit_test_attempt`.
   * Handles saving final answers, grading (auto), and updating attempt status.
   *
   * @param {string} attemptId - The ID of the test attempt being submitted.
   * @param {SubmitTestAttemptDto} submissionData - Validated submission data.
   * @param {User} user - The authenticated user submitting the test.
   * @returns {Promise<any>} JSON object with the final status of the attempt.
   * @throws {HttpException} If the RPC call fails or returns an error.
   */
  async submitTestAttempt(
    attemptId: string,
    submissionData: SubmitTestAttemptDto, // Now expect validated DTO
    user: User,
  ): Promise<any> {
    this.logger.log(
      `Calling RPC submit_test_attempt for attempt ID: ${attemptId}, User ID: ${user.id}`,
    );
    if (!this.supabaseClient)
      throw new InternalServerErrorException('Supabase client not available.');
    if (!user || !user.id)
      throw new InternalServerErrorException('User information is missing.');

    // Prepare answers in the format expected by the RPC function
    const formattedAnswers = {};
    for (const testQuestionId in submissionData.answers) {
      // Map the DTO structure to the simpler structure needed by the RPC
      // Assuming AnswerDto has mcAnswer, shortAnswer etc. and we decide which one is 'userAnswer'
      const answerDto = submissionData.answers[testQuestionId];
      let userAnswer = null;
      // Logic to determine the primary answer based on type (example)
      if (answerDto.mcAnswer !== undefined && answerDto.mcAnswer !== null)
        userAnswer = answerDto.mcAnswer;
      else if (
        answerDto.shortAnswer !== undefined &&
        answerDto.shortAnswer !== null
      )
        userAnswer = answerDto.shortAnswer;
      else if (
        answerDto.longAnswer !== undefined &&
        answerDto.longAnswer !== null
      )
        userAnswer = answerDto.longAnswer;
      // Add drawing logic if needed

      formattedAnswers[testQuestionId] = { userAnswer: userAnswer };
    }

    try {
      const { data, error } = await this.supabaseClient.rpc(
        'submit_test_attempt',
        {
          input_attempt_id: attemptId,
          input_user_id: user.id,
          input_answers: formattedAnswers, // Pass the formatted JSON
          input_time_left: submissionData.timeLeft,
        },
      );

      if (error) {
        this.logger.error(
          `RPC call submit_test_attempt failed for attempt ${attemptId}, user ${user.id}: ${error.message}`,
          error.details,
        );
        // Map DB errors to HTTP statuses
        if (error.message.includes('AttemptNotFound')) {
          throw new NotFoundException(
            `Test attempt with ID ${attemptId} not found.`,
          );
        }
        if (error.message.includes('Forbidden')) {
          throw new ForbiddenException(
            `You cannot submit attempt ${attemptId}.`,
          );
        }
        if (error.message.includes('AttemptNotSubmittable')) {
          throw new ForbiddenException(
            `Attempt ${attemptId} cannot be submitted (status was not 'in_progress').`,
          );
        }
        throw new InternalServerErrorException(
          `Failed to submit test: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully executed submit_test_attempt for attempt ID: ${attemptId}. Final status: ${data?.status}`,
      );
      return data; // This is the JSONB response from the function
    } catch (error) {
      this.logger.error(
        `Unexpected error calling RPC submit_test_attempt for attempt ${attemptId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while submitting the test.',
      );
    }
  }
}
