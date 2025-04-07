import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Routes that are publicly accessible without authentication.
 */
const publicRoutes = createRouteMatcher([
  // Public pages
  '/',                      // Home page
  '/sign-in(.*)',           // Sign in pages
  '/sign-up(.*)',           // Sign up pages
  
  // Public API endpoints
  '/api/webhooks/clerk',    // Clerk webhook endpoint
  '/api/webhooks/(.*)',     // Other webhook endpoints
  
  // Public assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

// Define API routes that should always be protected
const protectedApiRoutes = createRouteMatcher(['/api/users(.*)']);

// Check if Clerk is properly configured and warn if not
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  console.warn('⚠️ Clerk is not properly configured. Authentication may not work as expected.');
  console.warn('  Ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set in your .env file.');
}

// Export the middleware function with debug mode in development
export default clerkMiddleware(
  async (auth, req) => {
    // Check if the route is public
    const isPublic = publicRoutes(req);
    
    // If it's not a public route and it's a protected API route, enforce authentication
    if (!isPublic && protectedApiRoutes(req)) {
      try {
        await auth.protect();
      } catch (error) {
        // In development with placeholder keys, allow access despite auth errors
        if (process.env.NODE_ENV === 'development' && 
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
          console.warn('⚠️ Authentication bypass in development mode with placeholder keys');
          return NextResponse.next();
        }
        throw error;
      }
    }

    return NextResponse.next();
  },
  { debug: process.env.NODE_ENV === 'development' }
);

// Configure middleware to run on all routes except for static files
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};