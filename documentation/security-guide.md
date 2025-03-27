# Security & Authentication

This document outlines the security measures implemented in the Omniflo Platform to protect user data, ensure secure authentication, and maintain application integrity.

## Authentication

The application uses Clerk, a secure authentication provider, to handle user identity and access management.

### Authentication Flow

1. **User Registration**: Configured as invite-only to control access
2. **Authentication**: JWT-based authentication with Clerk
3. **Session Management**: Secure cookie-based sessions handled by Clerk
4. **Token Refresh**: Automatic token refresh to maintain sessions

### Implementation Details

- **Middleware**: Implemented using `clerkMiddleware` with a deny-by-default approach
- **Protected Routes**: All routes except explicitly public ones require authentication
- **Public Routes**: Configured in the middleware.ts file:

```typescript
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
  
  // Protect all routes except public ones
  if (!isPublic) {
    await auth.protect();
  }

  return NextResponse.next();
});

// Configure middleware matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|public/).*)',
    '/api/(.*)'
  ],
};
```

### User Management

- **User Creation**: Managed through Clerk webhooks
- **User Synchronization**: Clerk users are synchronized with the internal database
- **ID Mapping**: Application uses internal user IDs mapped from Clerk IDs through a utility function:

```typescript
// src/lib/auth.ts
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

## API Security

### HTTPS Enforcement

All API communications are secured using HTTPS with TLS 1.2+. This is enforced by our hosting provider (Vercel) and configured in the application.

### Security Headers

The application includes the following security headers for all responses, configured in the vercel.json file:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Input Validation

- **Client-Side Validation**: Form inputs are validated with custom validation logic
- **Server-Side Validation**: All API endpoints validate inputs through type checking and validation functions
- **Zod Schema Validation**: Complex types are validated with Zod for type safety
- **Content Type Verification**: File uploads are verified for correct MIME types before processing:

```typescript
// File type validation example from src/app/api/upload/route.ts
if (!isValidFileType(file.type, allowedFileTypes)) {
  return NextResponse.json({
    success: false,
    data: null,
    error: {
      message: 'Invalid file format',
      code: ErrorCode.UPLOAD_FAILED
    }
  }, { status: HTTP_STATUS.INVALID_FILE });
}
```

### Rate Limiting

Rate limiting is implemented to prevent abuse and ensure fair resource allocation:

- **User Limits**: 100 requests per hour per user
- **AI Quota**: Configurable token limits monitored and enforced (when using AI features)
- **Concurrent Processing**: Maximum of 5 concurrent processing jobs
- **Error Handling**: Exponential backoff for failed requests
- **Monitoring**: Real-time usage tracking and alerts

### Standardized Error Handling

All API endpoints use a consistent error response format:

```typescript
interface ApiErrorResponse {
  success: false;
  data: null;
  error: {
    message: string;
    code: ErrorCode;
  }
}
```

Standard error codes:

- `NOT_FOUND`: Requested resource not found
- `UNAUTHORIZED`: Authentication required or failed
- `BAD_REQUEST`: Invalid request format or data
- `INTERNAL_ERROR`: Server-side error
- `UPLOAD_FAILED`: File upload failed
- `PROCESSING_FAILED`: Processing operation failed
- `NETWORK_ERROR`: Network communication error
- `TIMEOUT`: Request exceeded time limit
- `INVALID_RESPONSE`: Invalid response format or data

## Data Protection

### File Security

- **Maximum Size**: 20MB limit for uploaded files
- **Format Validation**: Configurable file type validation (enforced via MIME type checking)
- **Storage**: Files are stored securely with appropriate access controls
- **Retention**: Configurable retention policies with automatic cleanup
- **Transfer**: All file transfers use encrypted connections (TLS)

### Personal Information

- **Data Minimization**: Only necessary data is collected and processed
- **PII Protection**: Personal Identifiable Information is not stored permanently in the database
- **Data Anonymization**: Logs and analytics exclude sensitive information
- **Access Control**: Access to personal data is restricted by user permission checks

### Database Security

- **Connection Security**: Database connections use encrypted transport (TLS)
- **Query Protection**: Prisma ORM provides parameterized queries to prevent SQL injection
- **Data Isolation**: Multi-tenant data is strictly isolated through user-based access control
- **Schema Design**: Proper relationships and constraints maintain data integrity

## Access Control

### Role-Based Access

- **User Roles**: Standard users can only access their own data
- **Administrator Role**: Limited to authorized personnel with extended privileges
- **Permission Checks**: All operations verify user permissions through middleware

### Resource Ownership

- **Template Ownership**: Templates are scoped to their creator through the userId field:
  ```typescript
  // Example permission check for templates
  const template = await prisma.template.findFirst({
    where: { 
      id,
      userId // Enforces ownership
    }
  })
  ```
- **File Access**: Users can only access files they uploaded
- **Cross-User Protection**: Strict validation prevents cross-user access

## Webhook Security

### Signature Verification

- **Clerk Webhooks**: Verified using SVIX signature verification
- **Webhook Secret**: Securely stored in environment variables
- **Request Validation**: Headers and payloads are validated

Example implementation in src/app/api/webhooks/clerk/route.ts:

```typescript
export async function POST(req: Request): Promise<Response> {
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing webhook headers', { status: HTTP_STATUS.UNAUTHORIZED });
  }

  try {
    const payload = await req.text();
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: HTTP_STATUS.UNAUTHORIZED });
  }
  
  // Process webhook event...
}
```

## Third-Party Integration Security

### API Key Management

- **Key Storage**: API keys stored in environment variables, never exposed to clients
- **Key Rotation**: Regular key rotation policy (90-day rotation schedule)
- **Access Scoping**: Keys have minimal necessary permissions

Secure initialization example for third-party services:

```typescript
// src/lib/integrations/service-client.ts
import { ServiceClient } from 'service-sdk';

if (!process.env.SERVICE_API_KEY) {
  throw new Error('Missing SERVICE_API_KEY environment variable');
}

export const serviceClient = new ServiceClient({
  apiKey: process.env.SERVICE_API_KEY,
  // Additional configuration options
});
```

### Integration Access Control

- **Service Isolation**: Integration points have appropriate isolation and scoping
- **Data Cleanup**: Automatic cleanup of temporary data to prevent data leakage
- **Response Validation**: All third-party responses are validated for format and content

## Deployment Security

### Environment Isolation

- **Development**: Isolated development environment with mock data
- **Staging**: Pre-production environment with production-like data
- **Production**: Strictly controlled production environment with full security measures

### Infrastructure Security

- **Provider**: Deployed on Vercel with built-in security features
- **Edge Network**: Global CDN with DDoS protection
- **Function Isolation**: Serverless functions run in isolated environments
- **Resource Limits**: Function execution limited to 60 seconds as configured in vercel.json:
  ```json
  "functions": {
    "src/app/api/**/route.ts": { 
      "maxDuration": 60 
    }
  }
  ```

## Monitoring and Logging

### Security Monitoring

- **Error Tracking**: Automatic monitoring of error rates and patterns
- **Suspicious Activity**: Detection of unusual access patterns
- **Rate Limit Breaches**: Alerts on rate limit violations
- **Authentication Failures**: Monitoring of failed authentication attempts

### Audit Logging

- **User Actions**: Logging of significant user actions
- **Admin Operations**: Comprehensive logging of administrative operations
- **API Access**: Recording of API access patterns and failures
- **Log Protection**: Logs are secured and cannot be tampered with

Example logging pattern used throughout the application:

```typescript
// API request logging
console.log('📥 Request received', {
  route: '/api/endpoint',
  method: 'POST',
  userId: session.userId,
  // No sensitive data logged
})

// Error logging
console.error('❌ Operation failed', {
  error: error.message,
  code: 'OPERATION_FAILED',
  // Stack trace in development only
  ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
})
```

## Incident Response

### Detection

- Real-time monitoring for security incidents
- Automated alerts for suspicious activities
- Regular security audits

### Response Plan

1. **Containment**: Immediate steps to contain the incident
2. **Investigation**: Root cause analysis and impact assessment
3. **Remediation**: Fix vulnerabilities and restore service
4. **Communication**: Notification to affected users
5. **Prevention**: Implementation of measures to prevent recurrence

## Compliance

- **GDPR**: Compliance with data protection regulations
  - Data minimization
  - Right to access, correction, and deletion
  - Lawful basis for processing
  
- **Industry-Specific Regulations**: Configurable for industry needs (where applicable)
  - Limited data sets
  - Secure transmission
  - Access controls
  
- **Data Retention**: Clear policies for data storage and deletion
  - Files deleted according to retention policies
  - User data retained only as long as necessary
  
- **User Rights**: Support for data access and deletion requests
  - Account deletion through Clerk
  - Data export functionality

## Future Security Enhancements

1. **Multi-factor authentication**: Implementation through Clerk's MFA capabilities
2. **Enhanced logging and monitoring**: Integration with dedicated logging service
3. **Regular security penetration testing**: Scheduled vulnerability assessments
4. **Advanced threat detection**: Implementation of behavior analysis for unusual patterns
5. **Automated security scanning**: Integration with security scanning tools in CI/CD pipeline 