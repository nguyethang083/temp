import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FindAllTestsQueryDto } from './dto/find-all-tests-query.dto';
import {
  AttemptStatus,
  TestAttemptStatusDto,
} from './dto/test-attempt-status.dto';

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
  async getTestAttemptStatus(
    testId: string,
    userId: string,
  ): Promise<TestAttemptStatusDto> {
    this.logger.log(
      `Workspaceing attempt status (simplified) for test ${testId}, user ${userId}`,
    );

    // 1. Get the Supabase Client (assuming it's initialized in constructor)
    // No need to re-assign if `this.supabaseClient` is correctly set in constructor
    if (!this.supabaseClient) {
      this.logger.error(
        'getTestAttemptStatus: supabaseClient is not available!',
      );
      throw new InternalServerErrorException(
        'Database client is not configured correctly.',
      );
    }

    // 2. Basic Input Validation
    if (!testId || !userId) {
      this.logger.warn(
        `Invalid input for getTestAttemptStatus: testId or userId missing.`,
      );
      // Consider throwing BadRequestException from '@nestjs/common' instead
      throw new InternalServerErrorException(
        'Required identifiers are missing.',
      );
    }

    try {
      // 3. Perform the Supabase Query
      const { data, error } = await this.supabaseClient
        .from('test_attempts') // Your table name
        .select('status') // Column you need
        .eq('test_id', testId) // Filter 1
        .eq('user_id', userId) // Filter 2
        .order('start_time', { ascending: false }) // Latest first
        .limit(1) // Only the latest
        .maybeSingle(); // Get one record or null

      // 4. Handle Potential Supabase Errors
      if (error) {
        // Log the database error minimally
        this.logger.error(
          `Supabase query failed in getTestAttemptStatus: ${error.message} (Code: ${error.code})`,
        );
        // Throw a generic server error for the client
        throw new InternalServerErrorException(
          'Could not retrieve test status due to a database error.',
        );
      }

      // 5. Determine Status Based on Result
      let status: AttemptStatus;
      if (data) {
        // Record found - check its status
        const dbStatus = data.status;
        if (dbStatus === 'in_progress' || dbStatus === 'completed') {
          status = dbStatus;
        } else {
          // Handle unexpected status from DB
          this.logger.warn(
            `Unexpected status "${dbStatus}" found for test ${testId}, user ${userId}. Defaulting to 'completed'.`,
          );
          status = 'completed'; // Default for safety, could be 'not_started'
        }
      } else {
        // No record found - user hasn't started this test
        status = 'not_started';
      }

      this.logger.log(
        `Determined status: ${status} for test ${testId}, user ${userId}`,
      );
      // 6. Return the result
      return { status };
    } catch (err) {
      // 7. Catch Unexpected Runtime Errors (could be the thrown InternalServerErrorException or others)
      this.logger.error(
        `Unexpected error in getTestAttemptStatus catch block for test ${testId}: ${err.message || err}`,
        // Avoid err.stack here unless you check 'err instanceof Error' first
        // Logging the 'err' object itself is generally safe
        err,
      );

      // Re-throw specific known errors if needed, otherwise wrap
      if (
        err instanceof InternalServerErrorException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      // Wrap unknown errors in a generic response
      throw new InternalServerErrorException(
        'An unexpected server error occurred while checking the test status.',
      );
    }
  }
}
