# SCR Extraction Tool: Technical Guide

## Architecture Overview

The SCR Extraction Tool is built with a modern stack that integrates several key technologies:

- **Frontend**: Next.js 14 with React 18, using the App Router
- **Authentication**: Clerk for user management and authentication
- **Database**: PostgreSQL with Prisma as the ORM
- **AI Integration**: OpenAI Assistants API for PDF extraction and processing
- **Styling**: Tailwind CSS with ShadcN UI components
- **State Management**: React Context and Hooks
- **API Layer**: Next.js API routes with custom error handling
- **Type Safety**: TypeScript throughout the codebase

## System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Browser │────▶│   Next.js App   │────▶│   API Routes    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐     ┌────────▼────────┐
│                 │     │                 │     │                 │
│   PostgreSQL    │◀───▶│     Prisma      │◀───▶│   Application   │
│    Database     │     │      ORM        │     │     Logic       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌─────────────────┐     ┌────────▼────────┐
                        │                 │     │                 │
                        │   OpenAI API    │◀───▶│ AI Integration  │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## Core Components

### 1. PDF Processing Pipeline

The application implements a processing pipeline for SCR documents with the following steps:

1. **File Upload Service** (`src/app/api/upload/route.ts`)
   - Handles secure file uploads to OpenAI's system
   - Validates file types (PDF only) and size limits (20MB)
   - Returns a unique file ID for subsequent processing
   - Implements error handling with standardized responses

2. **Data Extraction Service** (`src/app/api/extract/route.ts`)
   - Creates a new OpenAI thread for processing
   - Attaches the uploaded PDF to the thread
   - Selects the appropriate extraction assistant based on the template
   - Executes the extraction with retry logic
   - Validates the extracted JSON data structure
   - Returns structured patient data

3. **CSV Generation Service** (`src/app/api/generate-csv/route.ts`)
   - Accepts structured patient data from the extraction step
   - Selects the appropriate CSV generation assistant based on the template
   - Transforms the JSON data into a standardized CSV format
   - Returns the formatted CSV content
   - Implements validation to ensure proper format

4. **File Cleanup Service**
   - Automatically deletes temporary files from OpenAI after processing
   - Implements secure thread cleanup
   - Uses a 24-hour maximum retention policy
   - Includes error handling for failed deletions

### 2. Template Management System

The application includes a comprehensive template management system that allows customization of:

- **Extraction Templates**: Control how the AI assistant extracts data from PDFs
- **CSV Generation Templates**: Define the structure and format of output CSV files

#### Template Components:

1. **Database Models** (`prisma/schema.prisma`)
   - `Template`: Stores template configuration (title, instructions, model, etc.)
   - `AssistantType`: Defines the purpose (extraction or CSV generation)
   - `OpenAIModel`: Available AI models and capabilities
   - `UserTemplateSelection`: Tracks active template selections

2. **API Routes** (`src/app/api/templates/`)
   - CRUD operations for templates
   - Default template management
   - User template selection

3. **OpenAI Integration** (`src/lib/openai.ts`)
   - Creates and manages assistant configurations on OpenAI
   - Syncs local templates with OpenAI assistants
   - Handles assistant lifecycle (create, update, delete)

## API Reference

### Core Endpoints

#### File Upload

```typescript
POST /api/upload
Content-Type: multipart/form-data
Body: FormData with 'file' field containing a PDF

Response: {
  success: true,
  data: {
    fileId: string,       // OpenAI file ID
    filename: string,     // Original filename
    uploadedAt: string    // ISO timestamp
  }
}

Error Responses:
- 400: Invalid file (missing or not a PDF)
- 413: File too large (>20MB)
- 500: Upload failed (OpenAI API error)
```

#### Extract Data

```typescript
POST /api/extract
Content-Type: application/json
{
  fileId: string,         // OpenAI file ID from upload
  templateId?: string     // Optional template ID
}

Response: {
  success: true,
  data: {
    patient: {
      forename: string,
      surname: string,
      dob: string,        // YYYY-MM-DD format
      nhsNumber: string,
      gpPractice: string,
      registrationStatus: string
    },
    allergies: Array<{
      description: string,
      severity?: string,
      date?: string       // YYYY-MM-DD format
    }>,
    acuteMedications: Array<{
      name: string,
      dosage: string,
      frequency: string,
      startDate?: string  // YYYY-MM-DD format
    }>,
    repeatMedications: Array<{
      name: string,
      dosage: string,
      frequency: string,
      startDate?: string  // YYYY-MM-DD format
    }>,
    diagnoses: Array<{
      condition: string,
      diagnosedDate?: string  // YYYY-MM-DD format
    }>,
    problems: Array<{
      condition: string,
      severity?: string,
      notes?: string
    }>
  }
}

Error Responses:
- 400: Missing fileId
- 404: File not found
- 500: Extraction failed
```

#### Generate CSV

```typescript
POST /api/generate-csv
Content-Type: application/json
{
  data: PatientData,      // Structured data from extraction
  templateId?: string     // Optional template ID
}

Response: {
  success: true,
  data: {
    csvContent: string    // Formatted CSV content
  }
}

Error Responses:
- 400: Missing or invalid data
- 500: CSV generation failed
```

#### Template Management

```typescript
// Create template
POST /api/templates
{
  title: string,
  description: string,
  model: string,         // OpenAI model ID
  instructions: string,  // System instructions
  temperature: number,   // 0.0-2.0
  isDefault: boolean,
  assistantType: string  // "scr-extraction" or "csv-generation"
}

// List templates
GET /api/templates?assistantType=string

// Get template
GET /api/templates/:id

// Update template
PATCH /api/templates/:id
{
  title?: string,
  description?: string,
  model?: string,
  instructions?: string,
  temperature?: number,
  isDefault?: boolean
}

// Delete template
DELETE /api/templates/:id

// Get active templates
GET /api/templates/active

// Set active template
POST /api/templates/active
{
  assistantTypeId: string,
  templateId: string
}
```

## Database Schema

### Core Tables

The database schema is defined using Prisma and includes the following primary models:

#### User
```prisma
model User {
  id         String                  @id @default(cuid())
  clerkId    String                  @unique
  createdAt  DateTime                @default(now())
  updatedAt  DateTime                @updatedAt
  templates  Template[]
  selections UserTemplateSelection[]
}
```

#### Template
```prisma
model Template {
  id              String                  @id @default(cuid())
  title           String
  description     String
  instructions    String
  userId          String
  assistantTypeId String
  isDefault       Boolean                 @default(false)
  modelId         String
  temperature     Float
  assistantId     String?
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  assistantType   AssistantType           @relation(fields: [assistantTypeId], references: [id])
  model           OpenAIModel             @relation(fields: [modelId], references: [id])
  user            User                    @relation(fields: [userId], references: [id])
  selections      UserTemplateSelection[]
}
```

#### AssistantType
```prisma
model AssistantType {
  id          String                  @id @default(cuid())
  name        String                  @unique
  description String
  createdAt   DateTime                @default(now())
  updatedAt   DateTime                @updatedAt
  tools       AssistantTool[]
  templates   Template[]
  selections  UserTemplateSelection[]
}
```

#### AssistantTool
```prisma
model AssistantTool {
  id              String         @id @default(cuid())
  name            String
  type            OpenAIToolType
  description     String
  schema          Json?
  assistantTypeId String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  assistantType   AssistantType  @relation(fields: [assistantTypeId], references: [id])

  @@unique([name, type])
}
```

#### OpenAIModel
```prisma
model OpenAIModel {
  id          String     @id @default(cuid())
  openAIId    String     @unique
  name        String
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  templates   Template[]
}
```

#### UserTemplateSelection
```prisma
model UserTemplateSelection {
  id              String        @id @default(cuid())
  userId          String
  templateId      String
  assistantTypeId String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  assistantType   AssistantType @relation(fields: [assistantTypeId], references: [id])
  template        Template      @relation(fields: [templateId], references: [id])
  user            User          @relation(fields: [userId], references: [id])

  @@unique([userId, assistantTypeId])
}
```

#### Enums
```prisma
enum OpenAIToolType {
  file_search
  code_interpreter
  function
}
```

## Integration with OpenAI

### Assistant Configuration

The system uses two specialized OpenAI assistants:

1. **SCR Data Extraction Assistant**
   - Purpose: Extract structured data from SCR PDFs
   - Model: GPT-4o (configurable)
   - Key capabilities: 
     - File reading and analysis
     - Understanding NHS document formats
     - Structured data extraction into JSON
     - Field validation and normalization
   - Implementation: `src/lib/openai.ts`

2. **CSV Generation Assistant**
   - Purpose: Convert JSON data to formatted CSV
   - Model: GPT-4o (configurable)
   - Key capabilities:
     - Data transformation
     - CSV formatting
     - Clinical data standardization
     - Field validation
   - Implementation: `src/lib/openai.ts`

### Integration Flow

The integration with OpenAI follows a structured process:

```typescript
// Implementation flow for PDF processing
async function processDocument(fileId: string, extractionTemplateId?: string, csvTemplateId?: string) {
  // 1. Create a new thread for the conversation
  const threadId = await createThread();
  
  // 2. Add the PDF file to the thread
  await addFileToThread(threadId, fileId);
  
  // 3. Get the appropriate extraction assistant
  const extractionAssistant = extractionTemplateId
    ? await getTemplateAssistant(extractionTemplateId)
    : ASSISTANTS.EXTRACT_DATA;
  
  // 4. Run the extraction process
  const patientData = await extractPatientData(threadId, extractionAssistant);
  
  // 5. Get the appropriate CSV generation assistant
  const csvAssistant = csvTemplateId
    ? await getTemplateAssistant(csvTemplateId)
    : ASSISTANTS.GENERATE_CSV;
  
  // 6. Generate the CSV
  const csvContent = await generateCsv(threadId, csvAssistant, patientData);
  
  // 7. Clean up resources
  await cleanupThread(threadId);
  await deleteFile(fileId);
  
  return { patientData, csvContent };
}
```

### OpenAI API Helpers

The system includes several helper functions for working with the OpenAI API:

1. **Thread Management**
   - `createThread()`: Creates a new OpenAI thread
   - `addFileToThread(threadId, fileId)`: Attaches a file to a thread
   - `cleanupThread(threadId)`: Disposes of a thread after use

2. **Assistant Interaction**
   - `runAssistant(threadId, assistantId, instructions)`: Executes an assistant on a thread
   - `waitForRunCompletion(threadId, runId)`: Polls run status until completion
   - `getRunResult(threadId, runId)`: Retrieves the result of a completed run

3. **File Management**
   - `uploadPdfToOpenAI(file)`: Uploads a PDF file to OpenAI
   - `deleteFile(fileId)`: Removes a file from OpenAI storage

4. **Template Integration**
   - `getTemplateAssistant(templateId)`: Retrieves or creates an assistant for a template
   - `createAssistant(template)`: Creates a new OpenAI assistant from a template
   - `updateAssistant(assistantId, template)`: Updates an existing assistant
   - `deleteAssistant(assistantId)`: Removes an assistant from OpenAI

## Error Handling & Resilience

The application implements robust error handling:

### 1. Error Types

```typescript
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',           // Resource not found
  UNAUTHORIZED = 'UNAUTHORIZED',     // Authentication failed
  BAD_REQUEST = 'BAD_REQUEST',       // Invalid request parameters
  INTERNAL_ERROR = 'INTERNAL_ERROR', // Internal server error
  UPLOAD_FAILED = 'UPLOAD_FAILED',   // File upload failed
  PROCESSING_FAILED = 'PROCESSING_FAILED', // Processing operation failed
  NETWORK_ERROR = 'NETWORK_ERROR',   // Network communication failed
  TIMEOUT = 'TIMEOUT',               // Operation timed out
  INVALID_RESPONSE = 'INVALID_RESPONSE', // Invalid response format
}
```

### 2. Retry Strategies

The application implements exponential backoff for retrying transient errors:

```typescript
export async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let attempts = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      
      if (attempts >= maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
}
```

### 3. Error Response Format

All API endpoints return standardized error responses:

```typescript
{
  success: false,
  data: null,
  error: {
    message: string,  // Human-readable error message
    code: ErrorCode,  // Error code for programmatic handling
    details?: any     // Optional additional details
  }
}
```

## Performance Optimization

The application includes several performance optimizations:

1. **Caching**
   - Templates are cached for quick retrieval
   - User selections are cached in context
   - API responses are cached where appropriate

2. **Lazy Loading**
   - Components are lazy-loaded for better initial load times
   - Resources are loaded on demand
   - Heavy UI components use dynamic imports

3. **API Efficiency**
   - Parallel processing where possible
   - Optimized database queries with proper indexing
   - Structured logging for performance monitoring

4. **Client Optimizations**
   - Memoization of expensive calculations
   - Debouncing of frequent user interactions
   - Virtualization for large lists

## Development Environment Setup

### Prerequisites

- Node.js 18+ (for ESM and built-in fetch support)
- PostgreSQL 14+
- OpenAI API key with Assistants API access
- Clerk account and API keys
- Git for version control

### Environment Variables

```
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/scr_extraction"

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing Strategies

### Component Testing

The application uses Vitest and React Testing Library for component testing:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDropBox } from '@/components/file-drop-box';

describe('FileDropBox', () => {
  it('renders file upload area', () => {
    render(<FileDropBox onFileSelect={() => {}} selectedFile={null} />);
    expect(screen.getByText(/drop.*pdf file here/i)).toBeInTheDocument();
  });
  
  it('displays file details when file is selected', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<FileDropBox onFileSelect={() => {}} selectedFile={file} />);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
```

### API Testing

API routes are tested with Vitest and mocked fetch:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { uploadPdf } from '@/lib/api-client';

// Mock fetch
vi.mock('global', () => ({
  fetch: vi.fn()
}));

describe('API Client', () => {
  it('handles file upload', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        success: true, 
        data: { fileId: 'test_id' } 
      })
    });
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadPdf(file);
    
    expect(result.success).toBe(true);
    expect(result.data.fileId).toBe('test_id');
    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
  });
  
  it('handles error responses', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ 
        success: false, 
        error: { 
          message: 'Invalid file type',
          code: 'UPLOAD_FAILED'
        } 
      })
    });
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await expect(uploadPdf(file)).rejects.toThrow('Invalid file type');
  });
});
```

## Deployment

### Production Deployment

The application is optimized for deployment to modern cloud environments:

1. **Vercel Deployment**
   - Configured for Vercel's serverless platform
   - Uses Edge Runtime for API routes where appropriate
   - Leverages Vercel's PostgreSQL integration
   - Implements environment variable protection

2. **Docker Deployment**
   - Dockerfile provided for containerized deployment
   - Multi-stage build for optimized image size
   - Environment variable configuration
   - Health check endpoints

### Infrastructure Requirements

- PostgreSQL database (or compatible alternative)
- Node.js runtime environment (v18+)
- Environment for running serverless functions
- CDN for static asset delivery
- Secure environment variable storage

## Security Considerations

### Authentication & Authorization

- User authentication handled by Clerk
- JWT-based session management
- Role-based access control for resources
- Secure cookie configuration
- CSRF protection

### Data Protection

- Files temporarily stored in OpenAI's secure environment
- Automatic cleanup after processing (max 24 hours)
- No persistent storage of sensitive patient data
- Database encryption for sensitive fields
- All API communications secured with HTTPS

### API Security

- Rate limiting to prevent abuse
- Input validation for all API endpoints
- Content Security Policy implementation
- Secure headers configuration
- Logging sanitization for sensitive data

## Monitoring & Logging

The application implements comprehensive monitoring:

1. **Application Logging**
   - Structured JSON logs for machine readability
   - Log levels (debug, info, warn, error)
   - Request/response logging with sanitization
   - Error tracking with stack traces and context
   - User action auditing

2. **Performance Monitoring**
   - API response time tracking
   - Endpoint usage statistics
   - Database query performance
   - Memory and CPU utilization
   - Client-side performance metrics

3. **Error Tracking**
   - Automatic error reporting
   - Exception aggregation and grouping
   - Error trends and patterns
   - Alert thresholds and notifications
   - Error reproduction details

## Maintenance & Updates

### Dependency Management

- Regular updates of Node.js dependencies
- Security patches applied promptly
- Compatibility testing for updates
- Dependency vulnerability scanning
- Lock file maintenance

### Database Maintenance

- Regular backup schedule
- Migration planning and testing
- Index optimization for performance
- Query optimization monitoring
- Data retention policies

## Contributing

1. **Code Standards**
   - TypeScript for type safety
   - ESLint for code quality enforcement
   - Prettier for consistent formatting
   - Husky for pre-commit hooks
   - Conventional commits specification

2. **Pull Request Process**
   - Feature branch workflow
   - PR templates with checklists
   - Required reviewers configuration
   - CI/CD integration for automated testing
   - Preview deployments for visual review

3. **Documentation**
   - JSDoc for code documentation
   - Comprehensive README files
   - API documentation with examples
   - Architecture decision records
   - Technical specifications for features 