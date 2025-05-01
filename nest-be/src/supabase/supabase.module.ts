import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SupabaseService,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<SupabaseService> => {
        const logger = new Logger('SupabaseFactory');
        logger.log('Supabase factory starting...');

        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_SERVICE_KEY');

        logger.log(
          `Attempting to read SUPABASE_URL: ${supabaseUrl ? 'Found' : 'MISSING!'}`,
        );
        if (supabaseKey) {
          logger.log(
            `Attempting to read SUPABASE_SERVICE_KEY: Found. Length: ${supabaseKey.length}. Starts with: ${supabaseKey.substring(0, 3)}...`,
          );
        } else {
          logger.error('Attempting to read SUPABASE_SERVICE_KEY: MISSING!');
        }

        if (!supabaseUrl || !supabaseKey) {
          logger.error(
            'Supabase URL or Service Key is missing in environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.',
          );
          throw new Error('Supabase URL or Service Key is missing.');
        }

        logger.log('Attempting to create Supabase client...');
        try {
          const supabaseClient: SupabaseClient = createClient(
            supabaseUrl,
            supabaseKey,
            {
              auth: {
                autoRefreshToken: false,
                detectSessionInUrl: false,
                persistSession: false,
              },
            },
          );
          logger.log('Supabase client created successfully.');
          return new SupabaseService(supabaseClient);
        } catch (error) {
          logger.error(
            `Failed to create Supabase client during factory execution: ${error.message}`,
            error.stack,
          );
          throw new Error(
            `Supabase client initialization failed: ${error.message}`,
          );
        }
      },
    },
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
