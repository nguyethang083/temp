import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger, // Import Logger
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name); // Instantiate Logger

  // Inject the SupabaseService to access the admin client
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No authentication token found in request header.');
      throw new UnauthorizedException('Authentication token required.');
    }

    try {
      const supabase = this.supabaseService.getClient(); // Get the initialized Supabase client

      // Validate the token using Supabase Auth
      // This securely verifies the token with Supabase servers
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        this.logger.error(
          `Token validation error: ${error.message}`,
          error.stack,
        );
        // Distinguish between different errors if needed (e.g., expired token)
        throw new UnauthorizedException(
          `Token validation failed: ${error.message}`,
        );
      }

      if (!user) {
        this.logger.warn('Token is valid but no user found.');
        throw new UnauthorizedException('Invalid token or user not found.');
      }

      // IMPORTANT: Attach the validated user object to the request.
      // This makes the user info available in your route handlers (controllers).
      request['user'] = user;
    } catch (error) {
      // Catch potential exceptions during validation or if UnauthorizedException was thrown
      this.logger.error(`Authentication error: ${error.message}`, error.stack);
      // Re-throw UnauthorizedException or handle specific errors
      if (error instanceof UnauthorizedException) {
        throw error; // Re-throw if it's already the correct type
      }
      throw new UnauthorizedException('Authentication failed.'); // Generic fallback
    }

    return true; // If validation succeeds, allow access
  }

  // Helper function to extract token from "Bearer <token>" header
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
