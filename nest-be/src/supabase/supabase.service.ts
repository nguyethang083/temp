import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public readonly client: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    if (!supabaseClient) {
      this.logger.error(
        'Supabase client instance was not provided correctly during injection.',
      );
      throw new Error('Supabase client instance is invalid.');
    }
    this.client = supabaseClient;
    this.logger.log(
      'Supabase client successfully injected and available in SupabaseService.',
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
