/**
 * Base response type for all API endpoints
 */
export type ApiResponse<T> = {
  /** Whether the request was successful */
  success: true;
  /** The response data */
  data: T;
  error?: never;
} | {
  /** Whether the request was successful */
  success: false;
  /** The response data (null in error cases) */
  data: null;
  /** Error information */
  error: {
    /** Human-readable error message */
    message: string;
    /** Machine-readable error code */
    code: string;
  };
}

/**
 * Standard error format for API responses
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code */
  code: string;
  /** HTTP status code if applicable */
  status?: number;
}

/**
 * Response type for file upload endpoint
 */
export type UploadResponse = ApiResponse<{
  /** Unique identifier for the uploaded file */
  fileId: string;
  /** Original filename */
  filename: string;
  /** ISO timestamp of when the file was uploaded */
  uploadedAt: string;
}>;

/**
 * Response type for PDF processing endpoint
 */
export interface ProcessingResult {
  /** URL to access the processed PDF */
  pdfUrl: string;
  /** URL to download the generated CSV */
  csvUrl: string;
}

/**
 * Common HTTP status codes used in the API
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  INVALID_FILE: 400,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500,
} as const;

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE'
}

/**
 * Request type for data extraction endpoint
 */
export interface ExtractRequest {
  fileId: string;
  templateId?: string;  // ID of the template to use for extraction
}

/**
 * Response type for data extraction endpoint
 */
export type ExtractResponse = ApiResponse<Record<string, any>>;

/**
 * Request type for CSV generation endpoint
 */
export interface GenerateCsvRequest {
  data: Record<string, any>;
  templateId?: string;  // ID of the template to use for CSV generation
}

/**
 * Response type for CSV generation endpoint
 */
export type GenerateCsvResponse = ApiResponse<{
  csvContent: string;
}>

/**
 * Template data structure
 */
export interface Template {
  /** Unique identifier for the template */
  id: string;
  /** Template name */
  title: string;
  /** Template description */
  description: string;
  /** OpenAI model ID */
  model: string;
  /** System instructions for the AI */
  instructions: string;
  /** Temperature setting (0-2) */
  temperature: number;
  /** Whether this is the default template */
  isDefault: boolean;
  /** Type of assistant (e.g., "scr-extraction", "csv-generation") */
  assistantType: string;
  /** ID of the assistant type */
  assistantTypeId: string;
  /** OpenAI Assistant ID */
  assistantId?: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Request type for template creation
 */
export interface CreateTemplateRequest {
  /** Template name */
  title: string;
  /** Template description */
  description: string;
  /** OpenAI model ID */
  model: string;
  /** System instructions for the AI */
  instructions: string;
  /** Temperature setting (0-2) */
  temperature: number;
  /** Whether this should be the default template */
  isDefault: boolean;
  /** Type of assistant (e.g., "scr-extraction", "csv-generation") */
  assistantType: string;
  /** OpenAI Assistant ID - optional, will be created if not provided */
  assistantId?: string;
}

/**
 * Response type for template selections
 */
export interface TemplateSelectionResponse {
  /** Currently selected extraction template */
  extraction: Template | null;
  /** Currently selected CSV generation template */
  csv: Template | null;
}

/**
 * Project type definition
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Project name */
  name: string;
  /** Project description */
  description?: string;
  /** User ID of the project owner */
  userId: string;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * OpenAI model type
 */
export type OpenAIModel = {
  id: string;
  name: string;
  description?: string;
}

export interface ListModelsResponse {
  models: OpenAIModel[];
  lastSynced?: string;
}

/**
 * Patient data structure returned by extraction
 */
export type PatientData = Record<string, any>; 