# API Documentation

This document provides comprehensive information about the SCR Extraction Tool API endpoints, their request/response formats, and usage examples.

## Base URL

All API endpoints are available under the base URL of the application.

## Authentication

All API endpoints except public ones require authentication via Clerk. The Clerk middleware automatically handles authentication for protected routes through a JWT token.

## Response Format

All API endpoints follow a standardized response format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

### Standard Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | The requested resource was not found |
| `UNAUTHORIZED` | The request lacks valid authentication |
| `BAD_REQUEST` | The request was malformed or invalid |
| `INTERNAL_ERROR` | An internal server error occurred |
| `UPLOAD_FAILED` | The file upload failed |
| `PROCESSING_FAILED` | Processing of the request failed |
| `NETWORK_ERROR` | A network communication error occurred |
| `TIMEOUT` | The request timed out |
| `INVALID_RESPONSE` | The response is invalid or missing required fields |

## File Management

### List Files

Lists all files uploaded by the current user.

- **URL**: `/api/files`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "file_abc123",
        "filename": "patient_record.pdf"
      },
      {
        "id": "file_def456",
        "filename": "medical_history.pdf"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Failed to list files",
    "code": "PROCESSING_FAILED"
  }
}
```

### Delete File

Deletes a specific file.

- **URL**: `/api/files/[fileId]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: 
  - `fileId`: ID of the file to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Failed to delete file",
    "code": "PROCESSING_FAILED"
  }
}
```

## File Upload

### Upload PDF

Uploads a PDF file for processing.

- **URL**: `/api/upload`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: The PDF file to upload (max size: 20MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_abc123",
    "filename": "patient_record.pdf",
    "uploadedAt": "2023-01-01T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Only PDF files are allowed",
    "code": "UPLOAD_FAILED"
  }
}
```

**Notes:**
- File size is limited to 20MB
- Only PDF files are accepted
- Files are stored temporarily in OpenAI's secure storage
- Files are automatically deleted after processing (max 24h)

## Data Extraction

### Extract Patient Data

Extracts structured patient data from a previously uploaded PDF.

- **URL**: `/api/extract`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "fileId": "file_abc123",
  "templateId": "template_xyz789" // Optional, uses default SCR extraction template if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "forename": "John",
      "surname": "Doe",
      "dob": "1980-01-01",
      "nhsNumber": "123 456 7890",
      "gpPractice": "General Practice Name",
      "registrationStatus": "Registered"
    },
    "allergies": [
      {
        "description": "Penicillin",
        "severity": "High",
        "date": "2015-06-12"
      }
    ],
    "acuteMedications": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "4 times daily",
        "startDate": "2023-05-12"
      }
    ],
    "repeatMedications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Daily",
        "startDate": "2022-11-03"
      }
    ],
    "diagnoses": [
      {
        "condition": "Hypertension",
        "diagnosedDate": "2022-10-15"
      }
    ],
    "problems": [
      {
        "condition": "Lower back pain",
        "severity": "Moderate",
        "notes": "Ongoing management with physiotherapy"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "fileId is required",
    "code": "INVALID_RESPONSE"
  }
}
```

**Notes:**
- The structure of the extracted data may vary based on the template used
- The response format is validated to ensure consistency
- Processing may take up to 60 seconds due to the AI analysis
- Default extraction template is used if no templateId is provided

## CSV Generation

### Generate CSV

Generates a CSV file from structured patient data.

- **URL**: `/api/generate-csv`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "data": {
    "patient": {
      "forename": "John",
      "surname": "Doe",
      "dob": "1980-01-01",
      "nhsNumber": "123 456 7890"
      // other patient data fields
    },
    "allergies": [
      // allergy objects
    ],
    "medications": [
      // medication objects
    ]
    // other data fields
  },
  "templateId": "template_abc123" // Optional, uses default CSV generation template if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "csvContent": "Field,Value,Additional Information\nPatient Name,John Doe,\nDate of Birth,1980-01-01,\nNHS Number,123 456 7890,\nAllergies,Penicillin,Severe\nMedication,Paracetamol 500mg,4 times daily"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Data is required",
    "code": "INVALID_RESPONSE"
  }
}
```

**Notes:**
- CSV follows the format: `Field,Value,Additional Information`
- CSV content is validated before being returned
- Default CSV generation template is used if no templateId is provided
- CSV is returned as a string, not as a file download

## Template Management

### List Templates

Lists all available templates.

- **URL**: `/api/templates`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_abc123",
      "title": "Standard SCR Extraction",
      "description": "Extracts standard SCR data fields",
      "model": "gpt-4o",
      "temperature": 0.7,
      "isDefault": true,
      "assistantType": "scr-extraction",
      "assistantTypeId": "at_123",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    },
    {
      "id": "template_def456",
      "title": "Custom Medications Focus",
      "description": "Extraction focused on detailed medication data",
      "model": "gpt-4o",
      "temperature": 0.5,
      "isDefault": false,
      "assistantType": "scr-extraction",
      "assistantTypeId": "at_123",
      "createdAt": "2023-01-02T12:00:00Z",
      "updatedAt": "2023-01-02T12:00:00Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Failed to fetch templates",
    "code": "INTERNAL_ERROR"
  }
}
```

### Create Template

Creates a new template.

- **URL**: `/api/templates`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "title": "Custom SCR Extraction",
  "description": "Extracts custom SCR data fields",
  "model": "gpt-4o",
  "instructions": "Extract all medication information with special attention to dosages and frequencies. Include all allergies with severity ratings. Format patient name as 'Surname, Forename'.",
  "temperature": 0.7,
  "isDefault": false,
  "assistantType": "scr-extraction"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_abc123",
    "title": "Custom SCR Extraction",
    "description": "Extracts custom SCR data fields",
    "model": "gpt-4o",
    "instructions": "Extract all medication information...",
    "temperature": 0.7,
    "isDefault": false,
    "assistantType": "scr-extraction",
    "assistantTypeId": "at_123",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Model gpt-4o not found",
    "code": "INTERNAL_ERROR"
  }
}
```

**Notes:**
- If `isDefault` is set to true, any existing default template for the same assistant type will be updated to `isDefault: false`
- An OpenAI Assistant is automatically created and linked to the template
- Valid assistant types are: `scr-extraction` and `csv-generation`
- Temperature must be between 0.0 and 2.0

### Get Template

Retrieves a specific template.

- **URL**: `/api/templates/[templateId]`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: 
  - `templateId`: ID of the template to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_abc123",
    "title": "Custom SCR Extraction",
    "description": "Extracts custom SCR data fields",
    "model": "gpt-4o",
    "instructions": "Extract all medication information...",
    "temperature": 0.7,
    "isDefault": false,
    "assistantType": "scr-extraction",
    "assistantTypeId": "at_123",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Template not found",
    "code": "NOT_FOUND"
  }
}
```

### Update Template

Updates a specific template.

- **URL**: `/api/templates/[templateId]`
- **Method**: `PATCH`
- **Authentication**: Required
- **URL Parameters**: 
  - `templateId`: ID of the template to update
- **Content-Type**: `application/json`
- **Body**: Fields to update (same format as create template)
```json
{
  "title": "Updated SCR Extraction",
  "description": "Updated description",
  "instructions": "Updated instructions...",
  "temperature": 0.8,
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_abc123",
    "title": "Updated SCR Extraction",
    "description": "Updated description",
    "model": "gpt-4o",
    "instructions": "Updated instructions...",
    "temperature": 0.8,
    "isDefault": true,
    "assistantType": "scr-extraction",
    "assistantTypeId": "at_123",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-02T14:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Template not found",
    "code": "NOT_FOUND"
  }
}
```

**Notes:**
- Only include fields you want to update
- When setting `isDefault: true`, other templates of the same type will be updated to `isDefault: false`
- When updating instructions, the associated OpenAI Assistant is also updated

### Delete Template

Deletes a specific template.

- **URL**: `/api/templates/[templateId]`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: 
  - `templateId`: ID of the template to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Template not found",
    "code": "NOT_FOUND"
  }
}
```

**Notes:**
- When a template is deleted, the associated OpenAI Assistant is also deleted
- Any user selections referencing the template are also deleted

## Template Selection

### Get Active Templates

Gets the user's currently selected templates for each assistant type.

- **URL**: `/api/templates/active`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "selections": [
      {
        "id": "sel_abc123",
        "assistantType": {
          "id": "at_123",
          "name": "scr-extraction",
          "description": "Extract SCR data from PDF"
        },
        "template": {
          "id": "template_abc123",
          "title": "Standard SCR Extraction",
          "description": "Extracts standard SCR data fields"
        }
      },
      {
        "id": "sel_def456",
        "assistantType": {
          "id": "at_456",
          "name": "csv-generation",
          "description": "Generate CSV from extracted data"
        },
        "template": {
          "id": "template_def456",
          "title": "Standard CSV Generation",
          "description": "Generates standard CSV format"
        }
      }
    ]
  }
}
```

### Set Active Template

Sets a user's active template for a specific assistant type.

- **URL**: `/api/templates/active`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "assistantTypeId": "at_123",
  "templateId": "template_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sel_abc123",
    "assistantType": {
      "id": "at_123",
      "name": "scr-extraction",
      "description": "Extract SCR data from PDF"
    },
    "template": {
      "id": "template_abc123",
      "title": "Standard SCR Extraction",
      "description": "Extracts standard SCR data fields"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Template or assistant type not found",
    "code": "NOT_FOUND"
  }
}
```

## Models

### List AI Models

Lists all available AI models.

- **URL**: `/api/models`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "model_abc123",
        "openAIId": "gpt-4o",
        "name": "GPT-4o",
        "description": "Most capable model for SCR extraction",
        "isImported": true
      },
      {
        "id": "model_def456",
        "openAIId": "gpt-3.5-turbo",
        "name": "GPT-3.5 Turbo",
        "description": "Faster, more economical model",
        "isImported": true
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Failed to list available models",
    "code": "INTERNAL_ERROR"
  }
}
```

## User Management

### Get Current User

Retrieves information about the current authenticated user.

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_abc123",
      "clerkId": "user_clerk_abc123",
      "createdAt": "2023-01-01T12:00:00Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  }
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 400 | Bad Request - The request was malformed or invalid |
| 401 | Unauthorized - Authentication is required |
| 403 | Forbidden - The user is not authorized to access the resource |
| 404 | Not Found - The requested resource was not found |
| 500 | Internal Server Error - An error occurred on the server |

Each error response includes a specific error code and message to help with debugging and error handling. API clients should handle these error responses gracefully and present appropriate messages to the user. 