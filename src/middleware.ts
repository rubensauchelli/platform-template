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

// Export the middleware function with debug mode in development
export default clerkMiddleware(
  async (auth, req) => {
    // Check if the route is public
    const isPublic = publicRoutes(req);
    
    // If it's not a public route and it's a protected API route, enforce authentication
    if (!isPublic && protectedApiRoutes(req)) {
      await auth.protect();
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