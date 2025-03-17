import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that are publicly accessible without authentication.
 * Everything else will require authentication by default.
 */
const publicRoutes = createRouteMatcher([
  // Public pages
  '/',                                // Home page
  '/sign-in(.*)',                    // Sign in pages
  '/sign-up(.*)',                    // Sign up pages
  
  // Public API endpoints
  '/api/webhooks/clerk',             // Clerk webhook endpoint
  '/api/webhooks/(.*)',              // Other webhook endpoints
  
  // Public assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const isPublic = publicRoutes(req);
  const path = req.nextUrl.pathname;

  // Protect all routes except public ones
  if (!isPublic) {
    await auth.protect();
  }

  return NextResponse.next();
});

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder
     */
    '/((?!_next/static|_next/image|public/).*)',
    '/api/(.*)' // Match all API routes (fixed syntax)
  ],
};