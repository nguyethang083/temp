import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TopicsService {
  private readonly logger = new Logger(TopicsService.name);
  private supabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.logger.log('TopicsService Initialized.');
    try {
      this.supabaseClient = this.supabaseService.getClient();
      if (!this.supabaseClient) {
        throw new Error('getClient() returned null or undefined!');
      }
      this.logger.log(
        'Supabase client obtained successfully in TopicsService.',
      );
    } catch (error) {
      this.logger.error(
        `Error obtaining Supabase client in TopicsService: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to initialize Supabase client connection.',
      );
    }
  }

  /**
   * Retrieves all active topics from the database, sorted by the 'order' column.
   * @returns {Promise<any[]>} A sorted list of active topic objects.
   */
  async findAllActive() {
    this.logger.log('Fetching all active topics, sorted by order column.');

    if (!this.supabaseClient) {
      this.logger.error('findAllActive: supabaseClient is not available!');
      throw new InternalServerErrorException('Supabase client not available.');
    }

    try {
      // Fetch active topics from Supabase, ordering directly by the 'order' column
      const { data, error } = await this.supabaseClient
        .from('topics')
        .select('*')
        .eq('is_active', true) // Keep the filter for active topics
        .order('order', { ascending: true, nullsLast: true });
      // `nullsLast: true` places topics without an order value at the end

      if (error) {
        this.logger.error(
          `findAllActive: Supabase query error: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          `Could not fetch topics: ${error.message}`,
        );
      }

      const fetchedTopics = data || [];
      this.logger.log(
        `findAllActive: Successfully fetched and sorted ${fetchedTopics.length} active topics by order.`,
      );

      return fetchedTopics;
    } catch (error) {
      this.logger.error(
        `findAllActive: Unexpected error: ${error.message}`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching topics.',
      );
    }
  }
}
