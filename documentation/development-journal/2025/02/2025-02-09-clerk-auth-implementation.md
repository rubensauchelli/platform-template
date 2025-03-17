# Clerk Authentication Implementation

## Overview
Implemented Clerk authentication with a secure, deny-by-default approach for protecting our application routes.

## Key Changes

### Middleware Implementation
- Implemented a secure middleware that protects all routes by default
- Only explicitly listed routes are public
- Added development logging for easier debugging
- Protected routes include all API endpoints except webhooks

```typescript
const publicRoutes = createRouteMatcher([
  // Public pages
  '/',                    // Home page
  '/sign-in(.*)',        // Sign in pages
  '/sign-up(.*)',        // Sign up pages
  
  // Public API endpoints
  '/api/webhooks(.*)',   // Webhook endpoints
  
  // Public assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);
```

### Webhook Handler
- Set up webhook handler for user lifecycle events
- Handles user creation, updates, and deletion
- Syncs Clerk user data with our database
- Includes proper webhook signature verification

## Security Considerations
1. **Deny by Default**: All routes are protected unless explicitly made public
2. **Webhook Security**: Implemented signature verification for webhooks
3. **Development Logging**: Added detailed logging in development environment
4. **Asset Protection**: Properly configured static asset handling
5. **API Security**: All API routes are protected except webhooks

## Bug Fixes
### Webhook Testing on Vercel Preview Deployments
- **Issue**: Webhook endpoints returning 401 Unauthorized on Vercel preview deployments
- **Root Cause**: Vercel adds a security bypass header to preview deployments that needs to be configured in Clerk
- **Solution**: Added the Vercel bypass header to Clerk's webhook configuration
- **Note**: This only affects preview deployments, production deployments work as expected

### Middleware API Route Matcher
- **Issue**: Incorrect syntax in middleware matcher for API routes using `:path`
- **Fix**: Updated matcher pattern from `/api/:path*` to `/api/(.*)` to use correct regex syntax
- **Impact**: Ensures proper routing for all API endpoints

## Template Selection UI and Auth Improvements

### Warning Message for No Templates
- Added a warning message in the SCR extraction page when no templates are selected
- Initially implemented with custom colors, then refactored to use proper shadcn/ui variants
- Added a "warning" variant to the Alert component for consistent styling
- Made the empty state message more subtle and consistent with the templates page

```typescript
// Added warning variant to Alert component
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### User ID Handling Refactor

#### Initial Problem
- Discovered an issue where templates weren't being created despite 200 response
- Root cause: Incorrect handling of Clerk user IDs vs internal database user IDs
- Initially tried to handle the mapping in the database layer, which wasn't ideal

#### Better Architecture Implementation
1. Database Layer (`templates.ts`)
   - Now only deals with internal user IDs
   - No knowledge of Clerk or authentication
   - Pure database operations

2. Auth Layer (`auth.ts`)
   - Created new utility function `getInternalUserId`
   - Handles mapping between Clerk IDs and internal IDs
   - Single responsibility for auth-related operations

```typescript
export async function getInternalUserId(clerkId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.id
}
```

3. API Layer (route.ts files)
   - Handles authentication with Clerk
   - Uses the auth utility to get internal IDs
   - Passes clean internal IDs to database layer

#### Benefits of the Refactor
- Better separation of concerns
- Database layer is authentication-agnostic
- Easier to change auth providers in the future
- Cleaner error handling at each layer
- More testable code

## Technical Notes
- Using `clerkMiddleware` from `@clerk/nextjs/server`
- Webhook handler uses Clerk's built-in verification
- Development logging only enabled in development environment
- Matcher configuration optimized for Next.js static assets

## Next Steps
1. Move auth-related utilities to a dedicated directory (e.g., `src/lib/clerk/`)
2. Add more comprehensive error handling for auth failures
3. Consider caching user ID mappings for performance
4. Add logging for better debugging of auth-related issues
5. Deploy to Vercel and test webhook functionality
6. Set up webhook endpoint in Clerk Dashboard
7. Add webhook monitoring in Vercel
8. Test user lifecycle events (create, update, delete)

```typescript
const publicRoutes = createRouteMatcher([
  // Public pages
  '/',                    // Home page
  '/sign-in(.*)',        // Sign in pages
  '/sign-up(.*)',        // Sign up pages
  
  // Public API endpoints
  '/api/webhooks(.*)',   // Webhook endpoints
  
  // Public assets
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);
```
