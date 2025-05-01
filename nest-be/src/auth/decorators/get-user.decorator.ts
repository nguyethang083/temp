import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@supabase/supabase-js'; // Import the User type from Supabase

/**
 * Custom parameter decorator (@GetUser) to extract the validated Supabase User object
 * from the request object.
 *
 * This relies on a preceding Guard (like AuthGuard) attaching the user object
 * to the request (typically as `request.user`).
 *
 * @example
 * async myProtectedRoute(@GetUser() user: User) {
 * console.log(user.id);
 * }
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    // Explicitly type the return as Supabase User
    // Switch to the HTTP context to get the request object
    const request = ctx.switchToHttp().getRequest();

    // Check if the user object exists on the request (attached by the AuthGuard)
    if (!request.user) {
      // This shouldn't typically happen if the AuthGuard ran successfully,
      // but it's a good safeguard. Depending on requirements, you might
      // throw an InternalServerErrorException or handle it differently.
      console.error(
        '@GetUser Decorator Error: User object not found on request. Ensure AuthGuard runs before this route.',
      );
      // Returning null might be acceptable depending on how you use the decorator,
      // but throwing might be safer if the user is always expected.
      return null; // Or potentially throw new InternalServerErrorException('User not found in request');
    }

    // Return the user object attached by the AuthGuard
    return request.user;
  },
);
