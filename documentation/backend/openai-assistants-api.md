# OpenAI Assistants API Integration

This document provides an overview of how we integrate with OpenAI's Assistants API to process SCR (Summary Care Record) PDFs and generate structured CSV files.

## System Requirements

- OpenAI API Key with Assistants API access
- Node.js 18+
- TypeScript 5.0+
- Clerk for authentication

## Architecture Overview

The backend is built using Next.js App Router and consists of three main components:

1. **API Layer** (`src/app/api/*`)
   - RESTful endpoints for file operations
   - Protected routes with Clerk authentication
   - Standardized error responses

2. **OpenAI Integration** (`src/lib/openai.ts`)
   - Manages OpenAI Assistants and threads
   - Handles file uploads and processing
   - Implements retry logic for reliability

3. **Type System** (`src/types/*`)
   - Type definitions for API contracts
   - Error handling structures
   - OpenAI response types

## API Endpoints

1. **File Upload** (`POST /api/upload`)
   - Accepts PDF files up to 20MB
   - Returns file ID for further processing
   - Validates file type and size

2. **File Management** (`/api/files`)
   - `GET`: List uploaded files
   - `DELETE`: Remove specific files
   - Handles cleanup of processed files

3. **Data Extraction** (`POST /api/extract`)
   - Processes PDF using OpenAI Assistant
   - Extracts structured patient data
   - Returns standardized JSON format

4. **CSV Generation** (`POST /api/generate-csv`)
   - Converts structured data to CSV
   - Follows NHS data format standards
   - Returns downloadable CSV content

## Security Measures

1. **Authentication**
   - All endpoints protected by Clerk
   - API keys stored in environment variables
   - Key rotation every 90 days
   - Session timeout after 30 minutes
   - IP-based rate limiting

2. **Data Protection**
   - Temporary file storage (24h max retention)
   - End-to-end encryption in transit
   - Automatic file cleanup after processing
   - No PII stored permanently
   - Data anonymization in logs

3. **Access Control**
   - Role-based access control (RBAC)
   - Audit logging of all operations
   - IP allowlisting for admin access
   - Multi-factor authentication required

4. **Rate Limiting**
   - Request limits per user: 100 requests/hour
   - OpenAI quota management: 200K tokens/day
   - Concurrent processing limit: 5 files
   - Error handling for limits with exponential backoff
   - Real-time usage tracking and alerts

## Error Handling

- Standardized error responses
- Detailed error codes:
  - `ERR_FILE_TOO_LARGE`: PDF exceeds 20MB limit
  - `ERR_INVALID_FILE_TYPE`: Non-PDF file uploaded
  - `ERR_RATE_LIMIT`: User exceeded request quota
  - `ERR_PROCESSING`: OpenAI processing failed
  - `ERR_EXTRACTION`: Data extraction failed
  - `ERR_AUTH`: Authentication/authorization failed
- Automatic retries for transient failures
- Logging for debugging

## Production Considerations

1. **Environment Management**
   - Separate staging/production assistants
   - Regular API key rotation
   - Environment-specific configurations

2. **Monitoring**
   - Error tracking with Sentry
     - Error rate threshold: 5% of requests
     - Alert on critical errors within 1 minute
   - Usage monitoring
     - Daily active users tracking
     - Processing time per file (avg < 30s)
     - Success rate monitoring (target: 98%)
   - Performance metrics
     - API latency tracking (p95 < 500ms)
     - Memory usage alerts (> 80% threshold)
     - CPU utilization monitoring

3. **Performance**
   - Edge function deployment
     - Global CDN distribution
     - Automatic region selection
     - Cold start optimization < 100ms
   - Memory management
     - Streaming responses for large files
     - Garbage collection optimization
     - Memory limit: 512MB per function
   - Thread cleanup
     - Automatic thread pruning after 1 hour
     - Batch cleanup operations
     - Background task queuing
   - Response optimization
     - Compression for responses > 1KB
     - JSON minification
     - Cache-Control headers

4. **Scalability**
   - Queue system for large files
     - Redis-based job queue
     - Max concurrent jobs: 50
     - Priority queuing support
   - Webhook callbacks
     - Retry mechanism (max 3 attempts)
     - Webhook timeout: 10 seconds
     - Failure notifications
   - Worker processes
     - Auto-scaling (1-10 workers)
     - Load balancing across regions
     - Health check every 30s
   - Database optimization
     - Connection pooling
     - Query caching
     - Indexed lookups