# Guide: SCR PDF to CSV Workflow Using OpenAI Assistants API

## Prerequisites

- OpenAI API Key with Assistants API access
- Environment variables:
  ```bash
  OPENAI_API_KEY=your_key_here
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
  CLERK_SECRET_KEY=your_clerk_secret
  ```
- Node.js 18+ (for proper fetch API support)
- TypeScript 5.0+

## Overview

The workflow consists of four main endpoints:
1. `/api/upload` - Handles PDF file upload to OpenAI
2. `/api/files` - Lists and manages uploaded files
3. `/api/extract` - Extracts structured data from PDF using Assistant
4. `/api/generate-csv` - Converts structured data to CSV format

## Security Considerations

1. **Authentication**
   - All endpoints are protected by Clerk authentication
   - File operations are tied to the authenticated user
   - API keys are never exposed to the client

2. **Rate Limiting**
   - OpenAI has rate limits per organization
   - Implement retry logic for failed requests
   - Queue long-running operations

3. **File Handling**
   - Maximum file size: 20MB
   - Accepted formats: PDF only
   - Files are temporarily stored in OpenAI's system
   - Implement automatic cleanup for old files

## API Endpoints

### 1. File Upload (`/api/upload`)
- **Method**: `POST`
- **Purpose**: Upload SCR PDF to OpenAI's file system
- **Request**: `multipart/form-data` with PDF file
- **Response**:
```typescript
interface UploadResponse {
  success: true;
  data: {
    fileId: string;
    filename: string;
    uploadedAt: string;
  };
}
```
- **Error Handling**:
  - 400: Invalid file or no file provided
  - 413: File too large (>20MB)
  - 415: Unsupported file type
  - 500: OpenAI API errors

### 2. File Management (`/api/files`)
- **Method**: `GET` - List files
- **Method**: `DELETE /[fileId]` - Delete specific file
- **Response**:
```typescript
interface FilesResponse {
  success: true;
  data: Array<{
    id: string;
    filename: string;
  }>;
}
```
- **Error Handling**:
  - 404: File not found
  - 500: OpenAI API errors

### 3. Data Extraction (`/api/extract`)
- **Method**: `POST`
- **Purpose**: Extract structured data from PDF
- **Request**:
```typescript
interface ExtractRequest {
  fileId: string;
}
```
- **Response**: Structured patient data in JSON format
```typescript
interface ExtractResponse {
  success: true;
  data: {
    patient: {
      forename: string;
      surname: string;
      dob: string; // YYYY-MM-DD
      nhsNumber: string;
      gpPractice?: string;
    };
    demographics: {
      gender?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        postalCode: string;
      };
      contactInformation?: {
        phoneNumber?: string;
        email?: string;
      };
    };
    allergies: Array<{
      description: string;
      date?: string;
      severity?: string;
    }>;
    medications: Array<{
      type: string;
      name: string;
      dosage: string;
      frequency?: string;
      startDate?: string;
    }>;
    medicalHistory: Array<{
      condition: string;
      diagnosedDate?: string;
    }>;
    currentConditions: Array<{
      condition: string;
      severity?: string;
      notes?: string;
    }>;
    emergencyContacts?: Array<{
      name: string;
      relationship?: string;
      phoneNumber: string;
    }>;
  };
}
```
- **Error Handling**:
  - 400: Missing fileId
  - 404: File not found
  - 500: Processing errors or OpenAI API issues
- **Timeout**: 180 seconds (due to Assistant processing time)

### 4. CSV Generation (`/api/generate-csv`)
- **Method**: `POST`
- **Purpose**: Convert extracted JSON data to CSV format
- **Request**:
```typescript
interface GenerateCsvRequest {
  patientData: ExtractResponse['data'];
}
```
- **Response**:
```typescript
interface GenerateCsvResponse {
  success: true;
  data: {
    csvContent: string;
  };
}
```
- **Error Handling**:
  - 400: Invalid or missing patient data
  - 422: Data validation errors
  - 500: Processing errors

## Implementation Details

### OpenAI Integration (`src/lib/openai.ts`)
```typescript
export const ASSISTANTS = {
  EXTRACT_DATA: 'asst_...',  // Data extraction assistant ID
  GENERATE_CSV: 'asst_...'   // CSV generation assistant ID
} as const;

// Core functions for OpenAI interaction
export async function createThread(): Promise<string>;
export async function addFileMessage(threadId: string, fileId: string): Promise<void>;
export async function extractPatientData(threadId: string, assistantId: string): Promise<ExtractResponse['data']>;
export async function generateCsv(threadId: string, assistantId: string, data: any): Promise<string>;

// Utility functions
export async function cleanupThread(threadId: string): Promise<void>;
export async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T>;
```

### Error Handling
```typescript
export enum ErrorCode {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_TYPE = 'UNSUPPORTED_TYPE',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export enum HTTP_STATUS {
  SUCCESS = 200,
  CREATED = 201,
  INVALID_FILE = 400,
  NOT_FOUND = 404,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA = 415,
  UNPROCESSABLE = 422,
  SERVER_ERROR = 500
}

interface ApiError {
  message: string;
  code: ErrorCode;
  details?: Record<string, any>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
```

## Assistant Configurations

### Data Extraction Assistant
- **Purpose**: Extract structured data from SCR PDFs
- **Model**: GPT-4
- **Capabilities**: File reading, JSON structuring
- **Output**: Standardized JSON format with patient data
- **Timeout**: 3 minutes
- **Retry Strategy**: 3 attempts with exponential backoff

### CSV Generation Assistant
- **Purpose**: Convert JSON to formatted CSV
- **Model**: GPT-4
- **Output Format**:
  - Three columns: Field, Value, Additional Information
  - Organized sections with headers
  - Proper escaping of special characters
  - Standard date format (YYYY-MM-DD)
- **Timeout**: 30 seconds
- **Retry Strategy**: 2 attempts

## Frontend Integration

Example usage with React and TypeScript:
```typescript
import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

interface UploadState {
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
}

export function FileUploader() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    isProcessing: false,
    progress: 0
  });
  const toast = useToast();

  async function handleFileUpload(file: File) {
    try {
      setState(s => ({ ...s, isUploading: true }));
      
      // 1. Upload file
      const { fileId } = await uploadFile(file);
      setState(s => ({ ...s, progress: 25 }));
      
      // 2. Extract data
      const { data: extractedData } = await extractData(fileId);
      setState(s => ({ ...s, progress: 75 }));
      
      // 3. Generate CSV
      const { csvContent } = await generateCsv(extractedData);
      setState(s => ({ ...s, progress: 90 }));
      
      // 4. Trigger download
      downloadCsv(csvContent);
      setState(s => ({ ...s, progress: 100 }));
      
      toast.success('File processed successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setState(s => ({ 
        isUploading: false, 
        isProcessing: false, 
        progress: 0 
      }));
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={state.isUploading || state.isProcessing}
      />
      {(state.isUploading || state.isProcessing) && (
        <ProgressBar value={state.progress} />
      )}
    </div>
  );
}
```

## Testing

1. **Unit Tests**
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   import { uploadFile, extractData, generateCsv } from '@/lib/api';
   
   describe('SCR Processing Flow', () => {
     it('should handle file upload', async () => {
       const mockFile = new File([''], 'test.pdf', { type: 'application/pdf' });
       const result = await uploadFile(mockFile);
       expect(result.fileId).toBeDefined();
     });
   
     it('should handle extraction errors', async () => {
       await expect(extractData('invalid_id')).rejects.toThrow();
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   describe('Full Processing Flow', () => {
     it('should process a valid SCR', async () => {
       const file = await loadTestFile('valid-scr.pdf');
       const { fileId } = await uploadFile(file);
       const data = await extractData(fileId);
       const csv = await generateCsv(data);
       expect(csv).toContain('NHS Number');
     });
   });
   ```

## Error Recovery

1. **File Upload Failures**
   - Implement chunked uploads for large files
   - Provide resume capability
   - Clean up partial uploads

2. **Processing Timeouts**
   - Store processing state
   - Implement webhook callbacks
   - Allow manual retry

3. **Rate Limiting**
   - Queue requests
   - Implement backoff strategy
   - Show user-friendly wait times