# API Documentation

This document provides comprehensive information about the Omniflo Platform API endpoints, their request/response formats, and usage examples.

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
        "filename": "document.pdf"
      },
      {
        "id": "file_def456",
        "filename": "report.pdf"
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

### Upload File

Uploads a file to the platform.

- **URL**: `/api/upload`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: The file to upload (max size: 20MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_abc123",
    "filename": "document.pdf",
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
    "message": "Invalid file format",
    "code": "UPLOAD_FAILED"
  }
}
```

**Notes:**
- File size is limited to 20MB
- Supported file formats depend on the specific module
- Files are stored securely with controlled access
- Files may be automatically deleted after processing based on retention policy

## Data Processing

### Process Data

Processes data based on the specified template and settings.

- **URL**: `/api/process`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "fileId": "file_abc123",
  "templateId": "template_xyz789", // Optional, uses default template if not provided
  "options": { // Optional processing options
    "outputFormat": "json"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Processed data (structure depends on processing type)
    "result": {
      "key1": "value1",
      "key2": "value2",
      // ...
    },
    "processedAt": "2023-01-01T12:05:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Failed to process data",
    "code": "PROCESSING_FAILED"
  }
}
```

## Data Export

### Generate Export

Exports data in the specified format.

- **URL**: `/api/export`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "data": {
    // Structured data to be exported
    "record": {
      "field1": "value1",
      "field2": "value2"
      // other data fields
    },
    "items": [
      // array of items
    ]
    // other data structure
  },
  "format": "csv", // or "json", "excel", etc.
  "templateId": "template_abc123" // Optional, uses default export template if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Field,Value,Additional Information\nfield1,value1,\nfield2,value2,\nItems,3,Total count",
    "format": "csv"
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
- Supported export formats depend on the module configuration
- Default export template is used if no templateId is provided
- Content is returned as a string; for file downloads, use a separate endpoint

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
      "title": "Standard Data Processing",
      "description": "Processes data with standard fields",
      "model": "gpt-4o",
      "temperature": 0.7,
      "isDefault": true,
      "type": "data-processing",
      "typeId": "tp_123",
      "createdAt": "2023-01-01T12:00:00Z",
      "updatedAt": "2023-01-01T12:00:00Z"
    },
    {
      "id": "template_def456",
      "title": "Custom Data Export",
      "description": "Export template with advanced formatting",
      "model": "gpt-4o",
      "temperature": 0.5,
      "isDefault": false,
      "type": "data-export",
      "typeId": "tp_456",
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
  "title": "Custom Data Processing",
  "description": "Processes data with custom fields",
  "model": "gpt-4o",
  "instructions": "Process all data with special attention to details. Format output according to the following structure...",
  "temperature": 0.7,
  "isDefault": false,
  "type": "data-processing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_abc123",
    "title": "Custom Data Processing",
    "description": "Processes data with custom fields",
    "model": "gpt-4o",
    "instructions": "Process all data with special attention...",
    "temperature": 0.7,
    "isDefault": false,
    "type": "data-processing",
    "typeId": "tp_123",
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
- If `isDefault` is set to true, any existing default template for the same type will be updated to `isDefault: false`
- Template types are configurable and depend on the modules enabled in your instance
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
    "title": "Custom Data Processing",
    "description": "Processes data with custom fields",
    "model": "gpt-4o",
    "instructions": "Process all data with special attention...",
    "temperature": 0.7,
    "isDefault": false,
    "type": "data-processing",
    "typeId": "tp_123",
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
  "title": "Updated Data Processing",
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
    "title": "Updated Data Processing",
    "description": "Updated description",
    "model": "gpt-4o",
    "instructions": "Updated instructions...",
    "temperature": 0.8,
    "isDefault": true,
    "type": "data-processing",
    "typeId": "tp_123",
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
- Default templates cannot be deleted
- Any user selections referencing the template are also deleted

## Template Selection

### Get Active Templates

Gets the user's currently selected templates for each template type.

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
        "type": {
          "id": "tp_123",
          "name": "data-processing",
          "description": "Process data according to template"
        },
        "template": {
          "id": "template_abc123",
          "title": "Standard Data Processing",
          "description": "Processes data with standard fields"
        }
      },
      {
        "id": "sel_def456",
        "type": {
          "id": "tp_456",
          "name": "data-export",
          "description": "Export data in specified format"
        },
        "template": {
          "id": "template_def456",
          "title": "Standard Data Export",
          "description": "Exports data in standard format"
        }
      }
    ]
  }
}
```

### Set Active Template

Sets a user's active template for a specific template type.

- **URL**: `/api/templates/active`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "typeId": "tp_123",
  "templateId": "template_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sel_abc123",
    "type": {
      "id": "tp_123",
      "name": "data-processing",
      "description": "Process data according to template"
    },
    "template": {
      "id": "template_abc123",
      "title": "Standard Data Processing",
      "description": "Processes data with standard fields"
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
    "message": "Template or template type not found",
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
        "description": "Most capable model for complex processing",
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
    "message": "Failed to fetch models",
    "code": "INTERNAL_ERROR"
  }
}
```

### Import Models

Imports available models from OpenAI.

- **URL**: `/api/models/import`
- **Method**: `POST`
- **Authentication**: Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "models": [
      {
        "id": "model_abc123",
        "openAIId": "gpt-4o",
        "name": "GPT-4o",
        "isImported": true
      },
      {
        "id": "model_def456",
        "openAIId": "gpt-3.5-turbo",
        "name": "GPT-3.5 Turbo",
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
    "message": "OpenAI API key not configured",
    "code": "PROCESSING_FAILED"
  }
}
```

## User Management

### Get Current User

Gets information about the currently authenticated user.

- **URL**: `/api/user`
- **Method**: `GET`
- **Authentication**: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "clerkId": "user_clerk_abc123",
    "email": "user@example.com",
    "createdAt": "2023-01-01T12:00:00Z"
  }
}
```

### Update User Preferences

Updates preferences for the current user.

- **URL**: `/api/user/preferences`
- **Method**: `PATCH`
- **Authentication**: Required
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "browser": false
  },
  "defaultView": "list"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "browser": false
      },
      "defaultView": "list"
    },
    "updatedAt": "2023-01-01T12:00:00Z"
  }
}
```

## System Settings

### Get System Information

Gets information about the system configuration.

- **URL**: `/api/system/info`
- **Method**: `GET`
- **Authentication**: Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.2.3",
    "modules": ["core", "ai-processing", "data-export"],
    "environment": "production",
    "integrations": {
      "openai": true,
      "clerk": true,
      "vercel": true
    }
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