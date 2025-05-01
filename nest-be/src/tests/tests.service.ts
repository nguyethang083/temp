import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FindAllTestsQueryDto } from './dto/find-all-tests-query.dto';
import { User } from '@supabase/supabase-js';
import { SubmitTestAttemptDto } from './dto/submit-test-attempt.dto';
import { AttemptStatusEnum } from './enums/attempt-status-status.enum';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);
  private supabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabaseClient = this.supabaseService.getClient();
    this.logger.log('TestsService Initialized. Supabase client obtained.');
  }

  /**
   * Retrieves a list of active tests, potentially filtered, including the question count.
   * @param {FindAllTestsQueryDto} queryDto - DTO containing filter options.
   * @returns {Promise<any[]>} A list of active test objects including question count.
   */
  async findAllActive(queryDto: FindAllTestsQueryDto) {
    this.logger.log(
      `Fetching active tests with query: ${JSON.stringify(queryDto)}`,
    );
    if (!this.supabaseClient) {
      this.logger.error('findAllActive: supabaseClient is not available!');
      throw new InternalServerErrorException('Supabase client not available.');
    }
    try {
      let query = this.supabaseClient
        .from('tests')
        .select(
          `
            *,
            test_questions ( count )
        `,
        )
        .eq('is_active', true);

      // Apply optional filters
      if (queryDto.topicId) query = query.eq('topic_id', queryDto.topicId);
      if (queryDto.gradeLevel)
        query = query.eq('grade_level', queryDto.gradeLevel);
      if (queryDto.testType) query = query.eq('test_type', queryDto.testType);

      query = query.order('title', { ascending: true });

      const { data, error } = await query;

      if (error) {
        this.logger.error(
          `Error fetching active tests: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException('Could not fetch tests.');
      }
      if (data && data.length > 0) {
        this.logger.log(
          `Structure of first fetched test item: ${JSON.stringify(data[0])}`,
        );
      }
      this.logger.log(
        `Successfully fetched ${data?.length || 0} active tests.`,
      );
      return data || [];
    } catch (error) {
      this.logger.error(
        `Unexpected error in findAllActive: ${error.message}`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching tests.',
      );
    }
  }

  /**
   * Retrieves metadata/details for a single test, including question count.
   * @param {string} id - The UUID of the test to retrieve.
   * @returns {Promise<any>} The test metadata object with question count.
   * @throws {NotFoundException} If the test with the given ID is not found.
   * @throws {InternalServerErrorException} If there's an error fetching data.
   */
  async findOneDetails(id: string) {
    this.logger.log(`Fetching test metadata (with count) for ID: ${id}`);
    if (!this.supabaseClient) {
      this.logger.error('findOneDetails: supabaseClient is not available!');
      throw new InternalServerErrorException('Supabase client not available.');
    }
    try {
      const { data: testData, error: testError } = await this.supabaseClient
        .from('tests')
        .select(
          `
                *,
                test_questions ( count )
            `,
        ) // Select all test columns and the count of related questions
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle to return null if not found

      if (testError) {
        this.logger.error(
          `Error fetching test metadata ${id}: ${testError.message}`,
          testError.stack,
        );
        throw new InternalServerErrorException(
          'Could not fetch test metadata.',
        );
      }

      if (!testData) {
        this.logger.warn(`Test metadata with ID ${id} not found.`);
        throw new NotFoundException(`Test with ID ${id} not found.`);
      }

      return testData;
    } catch (error) {
      this.logger.error(
        `Unexpected error in findOneDetails for ID ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching test metadata.',
      );
    }
  }

  /**
   * Retrieves test metadata and sanitized questions needed to display the test-taking UI.
   * @param {string} id - The UUID of the test.
   * @returns {Promise<any>} Test metadata and sanitized questions.
   */
  async getTestDataForTaking(id: string) {
    if (!this.supabaseClient) {
      this.logger.error(
        'getTestDataForTaking: supabaseClient is not available!',
      );
      throw new InternalServerErrorException('Supabase client not available.');
    }
    try {
      // 1. Fetch Test Metadata (ensure it's active)
      const { data: testData, error: testError } = await this.supabaseClient
        .from('tests')
        .select('id, title, time_limit_minutes, instructions, is_active')
        .eq('id', id)
        .single(); // Expect exactly one or error

      if (testError) {
        if (testError.code === 'PGRST116') {
          this.logger.warn(`Test ID ${id} not found for taking.`);
          throw new NotFoundException(`Test with ID ${id} not found.`);
        }
        this.logger.error(
          `Error fetching test metadata for taking ${id}: ${testError.message}`,
          testError.stack,
        );
        throw new InternalServerErrorException(
          'Could not fetch test metadata for taking.',
        );
      }

      if (!testData.is_active) {
        this.logger.warn(`Attempt to get inactive test ID ${id} for taking.`);
        throw new NotFoundException(
          `Test with ID ${id} is not currently active.`,
        );
      }

      // 2. Fetch Associated Questions (Sanitized)
      const { data: questionsData, error: questionsError } =
        await this.supabaseClient
          .from('test_questions')
          .select(
            `
                point_value,
                question_order,
                question: questions (id, content, image_url, question_type, options, hint)
            `,
          )
          .eq('test_id', id)
          .order('question_order', { ascending: true, nullsFirst: false });

      if (questionsError) {
        this.logger.error(
          `Error fetching questions for test taking ${id}: ${questionsError.message}`,
          questionsError.stack,
        );
        throw new InternalServerErrorException(
          `Could not fetch test questions for taking: ${questionsError.message}`,
        );
      }

      // 3. Sanitize Options
      const sanitizedQuestions =
        questionsData?.map((item) => {
          let sanitizedOptions = item.question.options;
          if (Array.isArray(item.question.options)) {
            sanitizedOptions = item.question.options.map(
              ({ is_correct, ...option }) => option,
            );
          }
          return {
            ...item.question,
            options: sanitizedOptions,
            point_value: item.point_value,
            question_order: item.question_order,
          };
        }) || [];

      // 4. Combine and Return
      const result = {
        id: testData.id,
        title: testData.title,
        time_limit_minutes: testData.time_limit_minutes,
        instructions: testData.instructions,
        questions: sanitizedQuestions,
      };

      this.logger.log(
        `Successfully fetched test data and ${result.questions.length} sanitized questions for taking: ${id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Unexpected error in getTestDataForTaking for ID ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while preparing the test data.',
      );
    }
  }

  /**
   * Creates a new test attempt record for a given user and test.
   * Checks if an 'in_progress' attempt already exists for the user/test.
   * @param {string} testId - The UUID of the test.
   * @param {User} user - The authenticated Supabase user object (from AuthGuard).
   * @returns {Promise<any>} The newly created or existing 'in_progress' test attempt object.
   * @throws {NotFoundException} If the test is not found or inactive.
   * @throws {ConflictException} If creating attempt fails due to constraints.
   * @throws {InternalServerErrorException} For other errors.
   */
  async createTestAttempt(testId: string, user: User) {
    this.logger.log(
      `Attempting to create/find test attempt for test ID: ${testId}, User ID: ${user.id}`,
    );
    if (!this.supabaseClient) {
      this.logger.error('createTestAttempt: supabaseClient is not available!');
      throw new InternalServerErrorException('Supabase client not available.');
    }
    if (!user || !user.id) {
      this.logger.error(
        'createTestAttempt: User object or user ID is missing.',
      );
      throw new InternalServerErrorException('User information is missing.');
    }

    try {
      // 1. Verify the test exists and is active (optional, but good practice)
      const { data: testData, error: testCheckError } =
        await this.supabaseClient
          .from('tests')
          .select('id, is_active, time_limit_minutes') // Select needed fields
          .eq('id', testId)
          .single();

      if (testCheckError || !testData) {
        this.logger.warn(
          `Test ID ${testId} not found or error during check for attempt creation.`,
        );
        throw new NotFoundException(`Test with ID ${testId} not found.`);
      }
      if (!testData.is_active) {
        this.logger.warn(
          `Attempt to create attempt for inactive test ID ${testId}.`,
        );
        throw new NotFoundException(
          `Test with ID ${testId} is not currently active.`,
        );
      }

      // 2. Check for existing 'in_progress' attempt for this user and test
      const { data: existingAttempt, error: existingCheckError } =
        await this.supabaseClient
          .from('test_attempts')
          .select('*') // Select all columns of the attempt
          .eq('test_id', testId)
          .eq('user_id', user.id)
          .eq('status', 'in_progress') // Look specifically for 'in_progress'
          .maybeSingle(); // There should be at most one

      if (existingCheckError) {
        this.logger.error(
          `Error checking for existing attempts for test ${testId}, user ${user.id}: ${existingCheckError.message}`,
          existingCheckError.stack,
        );
        throw new InternalServerErrorException(
          'Could not check for existing test attempts.',
        );
      }

      if (existingAttempt) {
        this.logger.log(
          `Found existing 'in_progress' attempt ID ${existingAttempt.id} for test ${testId}, user ${user.id}. Returning existing.`,
        );
        // TODO: Potentially update remaining_time_seconds based on start_time if resuming
        return existingAttempt;
      }

      // 3. Create a new attempt if none in progress
      this.logger.log(
        `No 'in_progress' attempt found. Creating new attempt for test ${testId}, user ${user.id}.`,
      );
      const initialRemainingTime = testData.time_limit_minutes
        ? testData.time_limit_minutes * 60
        : null;

      const { data: newAttempt, error: insertError } = await this.supabaseClient
        .from('test_attempts')
        .insert({
          test_id: testId,
          user_id: user.id,
          status: 'in_progress', // Initial status
          start_time: new Date().toISOString(), // Record start time
          remaining_time_seconds: initialRemainingTime, // Set initial remaining time
          // score, end_time, passed will be null initially
        })
        .select() // Select the newly inserted row
        .single(); // Expect exactly one row back

      if (insertError) {
        this.logger.error(
          `Error inserting new test attempt for test ${testId}, user ${user.id}: ${insertError.message}`,
          insertError.stack,
        );
        // Handle potential constraint violations (e.g., duplicate attempt if logic flawed)
        if (insertError.code === '23505') {
          // PostgreSQL unique violation code
          throw new ConflictException(
            'Failed to create test attempt due to a conflict. Please try again.',
          );
        }
        throw new InternalServerErrorException(
          'Could not create new test attempt.',
        );
      }

      this.logger.log(
        `Successfully created new test attempt ID ${newAttempt.id} for test ${testId}, user ${user.id}.`,
      );
      return newAttempt;
    } catch (error) {
      this.logger.error(
        `Unexpected error in createTestAttempt for test ID ${testId}, user ${user.id}: ${error.message}`,
        error.stack,
      );
      // Re-throw specific exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while starting the test attempt.',
      );
    }
  }

  /**
   * Processes a test submission: saves answers, grades, updates attempt status.
   * @param {string} attemptId - The ID of the test attempt being submitted.
   * @param {SubmitTestAttemptDto} submissionData - The submitted answers and data.
   * @param {User} user - The authenticated user submitting the test.
   * @returns {Promise<any>} The updated test attempt object with score and status.
   */
  async submitTestAttempt(
    attemptId: string,
    submissionData: SubmitTestAttemptDto,
    user: User,
  ): Promise<any> {
    this.logger.log(
      `Processing submission for attempt ID: ${attemptId}, User ID: ${user.id}`,
    );
    if (!this.supabaseClient)
      throw new InternalServerErrorException('Supabase client not available.');
    if (!user || !user.id)
      throw new InternalServerErrorException('User information is missing.');

    const { answers, timeLeft } = submissionData;

    // IMPORTANT: For atomicity, consider wrapping steps 3-6 in a Supabase Database Function (RPC).
    // This example uses sequential operations which lack rollback on partial failure.

    try {
      // 1. Fetch the Test Attempt and associated Test details
      const { data: attemptData, error: attemptError } =
        await this.supabaseClient
          .from('test_attempts')
          .select(`*, test: tests (id, passing_score)`)
          .eq('id', attemptId)
          .single();

      if (attemptError || !attemptData) {
        this.logger.warn(
          `Attempt ID ${attemptId} not found or error fetching: ${attemptError?.message}`,
        );
        throw new NotFoundException(
          `Test attempt with ID ${attemptId} not found.`,
        );
      }

      // 2. Authorization Check
      if (attemptData.user_id !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to submit this test attempt.',
        );
      }
      if (attemptData.status !== AttemptStatusEnum.InProgress) {
        // Use Enum
        throw new ForbiddenException(
          `This test attempt cannot be submitted (status: ${attemptData.status}).`,
        );
      }

      // 3. Fetch Correct Answers and Point Values
      const questionIds = Object.keys(answers);
      if (questionIds.length === 0) {
        this.logger.warn(`Attempt ${attemptId} submitted with no answers.`);
        // Handle this case - maybe score 0?
      }

      // Fetch question details needed for grading
      const { data: questionDetails, error: questionError } =
        await this.supabaseClient
          .from('questions')
          .select('id, correct_answer, question_type')
          .in('id', questionIds);

      if (questionError)
        throw new InternalServerErrorException(
          'Could not retrieve question details for grading.',
        );

      // Fetch point values from junction table
      const { data: pointValuesData, error: pointsError } =
        await this.supabaseClient
          .from('test_questions')
          .select('question_id, point_value')
          .eq('test_id', attemptData.test_id)
          .in('question_id', questionIds);

      if (pointsError)
        throw new InternalServerErrorException(
          'Could not retrieve point values for grading.',
        );

      const correctAnswersMap = new Map(
        questionDetails.map((q) => [
          q.id,
          { answer: q.correct_answer, type: q.question_type },
        ]),
      );
      const pointsMap = new Map(
        pointValuesData.map((pv) => [pv.question_id, pv.point_value]),
      );

      // 4. Grade Answers & Prepare attempt_answers records (Simplified - No Insert Here)
      let totalScore = 0;
      // const attemptAnswerRecords = []; // If inserting answers later

      for (const questionId in answers) {
        const userAnswerData = answers[questionId];
        const correctAnswerData = correctAnswersMap.get(questionId);
        const points = pointsMap.get(questionId) || 0;
        let isCorrect: boolean | null = false; // Default to false, null for manual grading

        if (correctAnswerData) {
          switch (
            (correctAnswerData as { answer: string; type: string }).type
          ) {
            case 'multiple_choice':
              isCorrect =
                userAnswerData.mcAnswer?.toUpperCase() ===
                (correctAnswerData as { answer: string }).answer?.toUpperCase();
              break;
            case 'short_answer':
              isCorrect =
                userAnswerData.shortAnswer?.trim().toLowerCase() ===
                (correctAnswerData as { answer: string }).answer
                  ?.trim()
                  .toLowerCase();
              break;
            case 'self_write':
            case 'essay':
              isCorrect = null; // Requires manual grading
              break;
            // Add 'drawing' case if applicable
          }
          if (isCorrect === true) totalScore += points as number;
        }
        // TODO: Prepare record for attemptAnswerRecords if inserting later
      }

      // 5. Determine Final Status
      // Check if any question requires manual grading
      const needsManualGrading = questionDetails.some(
        (q) =>
          ['self_write', 'essay'].includes(q.question_type) &&
          questionIds.includes(q.id),
      );
      const finalStatus: AttemptStatusEnum = needsManualGrading
        ? AttemptStatusEnum.Completed
        : AttemptStatusEnum.Graded; // Use 'Graded' if auto-graded, 'Completed' otherwise
      const passingScore = attemptData.test?.passing_score ?? null;
      const passed =
        passingScore !== null && finalStatus === AttemptStatusEnum.Graded
          ? totalScore >= passingScore
          : null; // Can only determine pass/fail if auto-graded

      // 6. Update the Test Attempt Record
      const { data: updatedAttempt, error: updateError } =
        await this.supabaseClient
          .from('test_attempts')
          .update({
            score: finalStatus === AttemptStatusEnum.Graded ? totalScore : null, // Only set score if fully auto-graded
            status: finalStatus,
            passed: passed,
            end_time: new Date().toISOString(),
            // remaining_time_seconds: timeLeft // Update remaining time
          })
          .eq('id', attemptId)
          .select()
          .single();

      if (updateError) {
        this.logger.error(
          `Error updating test attempt ${attemptId}: ${updateError.message}`,
          updateError.stack,
        );
        throw new InternalServerErrorException(
          'Could not finalize test attempt.',
        );
      }

      this.logger.log(
        `Successfully processed submission for attempt ID: ${attemptId}. Status: ${finalStatus}, Score: ${totalScore}, Passed: ${passed}`,
      );
      return updatedAttempt;
    } catch (error) {
      this.logger.error(
        `Unexpected error processing submission for attempt ${attemptId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while submitting the test.',
      );
    }
  }
}
