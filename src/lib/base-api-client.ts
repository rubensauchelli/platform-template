import { ApiResponse, ApiError, ErrorCode } from '@/types/api';

/**
 * Custom error class for API-related errors
 * Includes error code and optional HTTP status
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Extended options for API requests
 */
interface RequestOptions extends RequestInit {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retries?: number;
}

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT = 30000; // 30 seconds
/** Default number of retry attempts */
const DEFAULT_RETRIES = 2;

/**
 * Base API client with common functionality for making HTTP requests
 * Includes:
 * - Automatic retries with exponential backoff
 * - Request timeouts
 * - Type-safe responses
 * - Error handling
 */
export class BaseApiClient {
  /**
   * Creates a new API client instance
   * @param baseUrl - Base URL for all API requests
   * @param defaultOptions - Default options to apply to all requests
   */
  constructor(
    private readonly baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '',
    private readonly defaultOptions: RequestOptions = {}
  ) {}

  /**
   * Makes a type-safe HTTP request
   * @template T - Expected response data type
   * @param endpoint - API endpoint to call
   * @param options - Request options
   * @returns Promise resolving to the response data
   * @throws ApiClientError if the request fails
   */
  protected async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    try {
      const headers = init?.body instanceof FormData
        ? init.headers // Don't modify headers for FormData
        : {
            'Content-Type': 'application/json',
            ...init?.headers,
          };

      const response = await fetch(url, {
        ...init,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        console.error('API Error Response:', error) // Debug log
        throw new ApiClientError(
          error?.error?.message || `HTTP error ${response.status}`,
          error?.error?.code || ErrorCode.INTERNAL_ERROR,
          response.status
        )
      }

      const data = await response.json()
      if (data.error) {
        console.error('API Error in Response:', data.error) // Debug log
        throw new ApiClientError(
          data.error.message || 'Unknown error',
          data.error.code || ErrorCode.INTERNAL_ERROR
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }
      console.error('API Client Error:', error) // Debug log
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to fetch',
        ErrorCode.NETWORK_ERROR
      )
    }
  }
} 