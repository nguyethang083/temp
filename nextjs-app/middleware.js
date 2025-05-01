import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  // Get the NextAuth token
  // Ensure NEXTAUTH_SECRET is set in your environment variables
  // The secret is required by getToken
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthenticated = !!token;

  // Define public paths (accessible without login)
  const publicPaths = [
    "/auth/login", 
    "/auth/signup", 
    "/auth/error",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/check-email",
    "/"
  ]; 
  
  // Define auth paths (login/signup pages)
  const authPaths = ["/auth/login", "/auth/signup"];
  
  // Define protected paths
  const protectedPaths = [
    "/dashboard",
    "/settings",
    "/learn",
    "/test",
    "/report",
    "/analytics",
  ]; // Add all protected routes

  // Check if the current path is protected
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  // Check if the current path is an auth page
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  
  // Special case for email verification with type param
  const isEmailVerificationCallback = pathname.startsWith("/auth/verify-email") && 
    (searchParams.get("type") === "signup" || searchParams.get("type") === "email_confirmation");

  // --- Redirect Logic ---

  // If user is authenticated
  if (isAuthenticated) {
    // If trying to access login/signup page, redirect to dashboard
    if (isAuthPath) {
      // Construct the absolute URL for redirection
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  // If user is NOT authenticated
  else {
    // Skip auth middleware for email verification callback
    if (isEmailVerificationCallback) {
      return NextResponse.next();
    }
    
    // If trying to access a protected page, redirect to login
    if (isProtectedRoute) {
      // Store the intended destination to redirect back after login (optional)
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname); // Pass original path
      return NextResponse.redirect(loginUrl);
    }
  }

  // If none of the above conditions met, allow the request to proceed
  // This allows access to public pages for unauthenticated users,
  // and access to non-auth/non-protected pages for authenticated users.
  return NextResponse.next();
}

// Configuration for the middleware matcher
export const config = {
  // Matcher specifies which paths the middleware should run on.
  // Adjust this to include all paths you want to protect or manage.
  // Avoid matching API routes, _next/static, _next/image, favicon.ico unless intended.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
