import { 
  UploadResponse, 
  ProcessingResult, 
  PatientData, 
  ErrorCode,
  Template,
  CreateTemplateRequest,
  TemplateSelectionResponse,
  OpenAIModel,
  ApiResponse,
  ListModelsResponse,
  ExtractResponse,
  GenerateCsvResponse,
} from '@/types/api';
import { BaseApiClient, ApiClientError } from './base-api-client';

/**
 * API client for the SCR Extraction service
 * Handles file uploads and PDF processing
 */
class ApiClient extends BaseApiClient {
  /**
   * Uploads a PDF file to the server
   * @param file - The PDF file to upload
   * @returns Promise resolving to the upload response
   * @throws ApiClientError if upload fails
   */
  async uploadPdf(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.fetch<UploadResponse>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Processes an uploaded PDF file
   * @param fileId - ID of the uploaded file to process
   * @returns Promise resolving to the processing result
   * @throws ApiClientError if processing fails
   */
  async processPdf(fileId: string): Promise<ProcessingResult> {
    return this.fetch<ProcessingResult>('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });
  }

  /**
   * Extracts patient data from a PDF file
   * @param fileId - ID of the uploaded file to process
   * @param templateId - Optional ID of the template to use for extraction
   * @returns Promise resolving to the extracted patient data
   * @throws ApiClientError if extraction fails
   */
  async extractData(fileId: string, templateId?: string): Promise<ExtractResponse> {
    return this.fetch<ExtractResponse>('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId, templateId }),
    });
  }

  /**
   * Generates a CSV file from patient data
   * @param patientData - The extracted patient data to convert to CSV
   * @param templateId - Optional ID of the template to use for CSV generation
   * @returns Promise resolving to the CSV content
   * @throws ApiClientError if generation fails
   */
  async generateCsv(patientData: PatientData, templateId?: string): Promise<GenerateCsvResponse> {
    return this.fetch<GenerateCsvResponse>('/api/generate-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: patientData, templateId }),
    });
  }

  /**
   * Deletes a file from OpenAI
   * @param fileId - ID of the file to delete
   * @throws ApiClientError if deletion fails
   */
  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new ApiClientError(
        error?.error?.message || 'Failed to delete file',
        error?.error?.code || ErrorCode.PROCESSING_FAILED,
        response.status
      );
    }
  }

  /**
   * Creates a new template
   * @param data Template data
   * @returns Promise resolving to the created template
   * @throws ApiClientError if creation fails
   */
  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    return this.fetch<Template>('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Lists all templates
   * @returns Promise resolving to an array of templates
   * @throws ApiClientError if fetch fails
   */
  async listTemplates(): Promise<ApiResponse<Template[]>> {
    return this.fetch<ApiResponse<Template[]>>('/api/templates');
  }

  /**
   * Gets a template by ID
   * @param id Template ID
   * @returns Promise resolving to the template
   * @throws ApiClientError if fetch fails
   */
  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.fetch<ApiResponse<Template>>(`/api/templates/${id}`);
  }

  /**
   * Updates a template
   * @param id Template ID
   * @param data Template data to update
   * @returns Promise resolving to the updated template
   * @throws ApiClientError if update fails
   */
  async updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<ApiResponse<Template>> {
    return this.fetch<ApiResponse<Template>>(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Deletes a template
   * @param id Template ID
   * @throws ApiClientError if deletion fails
   */
  async deleteTemplate(id: string): Promise<void> {
    await this.fetch<null>(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Gets all default templates for the current user
   * @returns Promise resolving to a map of assistant type to template
   * @throws ApiClientError if fetch fails
   */
  async getDefaultTemplates(): Promise<{ [key: string]: Template | null }> {
    return this.fetch<{ [key: string]: Template | null }>('/api/users/templates/defaults');
  }

  /**
   * Sets a template as the default for its assistant type
   * @param templateId Template ID
   * @param type Assistant type
   * @returns Promise resolving to the updated template
   * @throws ApiClientError if update fails
   */
  async setDefaultTemplate(templateId: string, type: string): Promise<Template> {
    return this.fetch<Template>(`/api/users/templates/defaults/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId }),
    });
  }

  /**
   * Removes the default template for an assistant type
   * @param type Assistant type
   * @throws ApiClientError if update fails
   */
  async removeDefaultTemplate(type: string): Promise<void> {
    await this.fetch<void>(`/api/users/templates/defaults/${type}`, {
      method: 'DELETE',
    });
  }

  async getTemplateSelections(): Promise<ApiResponse<TemplateSelectionResponse>> {
    return this.fetch<ApiResponse<TemplateSelectionResponse>>('/api/templates/selections');
  }

  async updateTemplateSelection(assistantTypeId: string, templateId: string): Promise<void> {
    await this.fetch<void>('/api/templates/selections', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assistantTypeId, templateId }),
    });
  }

  /**
   * Lists all imported OpenAI models
   * @returns Promise resolving to the list of models
   * @throws ApiClientError if fetch fails
   */
  async listImportedModels(queryString?: string): Promise<ApiResponse<ListModelsResponse>> {
    try {
      const url = `/api/models${queryString ? `?${queryString}` : ''}`
      const response = await this.fetch<ApiResponse<ListModelsResponse>>(url)
      if (!response?.data?.models) {
        throw new Error('Invalid response format from models API')
      }
      return response
    } catch (error) {
      console.error('API Client - List Models Error:', error)
      throw error instanceof Error 
        ? new ApiClientError(error.message, ErrorCode.INTERNAL_ERROR) 
        : new ApiClientError('Failed to fetch models', ErrorCode.INTERNAL_ERROR)
    }
  }

  /**
   * Lists all available OpenAI models
   * @returns Promise resolving to the list of models with import status
   * @throws ApiClientError if fetch fails
   */
  async listAvailableModels(): Promise<ApiResponse<{ models: (OpenAIModel & { isImported: boolean })[] }>> {
    try {
      const response = await this.fetch<ApiResponse<{ models: (OpenAIModel & { isImported: boolean })[] }>>('/api/models', {
        method: 'POST',
      })
      if (!response?.data?.models) {
        throw new Error('Invalid response format from models API')
      }
      return response
    } catch (error) {
      console.error('API Client - List Available Models Error:', error)
      throw error instanceof Error 
        ? new ApiClientError(error.message, ErrorCode.INTERNAL_ERROR)
        : new ApiClientError('Failed to fetch available models', ErrorCode.INTERNAL_ERROR)
    }
  }

  /**
   * Imports a model from OpenAI
   * @param modelId The OpenAI model ID to import
   * @returns Promise resolving to the imported model
   * @throws ApiClientError if import fails
   */
  async importModel(modelId: string): Promise<OpenAIModel> {
    try {
      const response = await this.fetch<ApiResponse<{ model: OpenAIModel }>>(`/api/models/${modelId}`, {
        method: 'POST',
      })
      if (!response?.success || !response?.data?.model) {
        throw new Error('Invalid response format from model import API')
      }
      return response.data.model
    } catch (error) {
      console.error('API Client - Import Model Error:', error)
      throw error instanceof Error 
        ? new ApiClientError(error.message, ErrorCode.INTERNAL_ERROR)
        : new ApiClientError('Failed to import model', ErrorCode.INTERNAL_ERROR)
    }
  }

  /**
   * Removes an imported model
   * @param modelId The model ID to remove
   * @returns Promise resolving to void
   * @throws ApiClientError if removal fails
   */
  async removeModel(modelId: string): Promise<void> {
    try {
      await this.fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('API Client - Remove Model Error:', error)
      throw error instanceof Error 
        ? new ApiClientError(error.message, ErrorCode.INTERNAL_ERROR)
        : new ApiClientError('Failed to remove model', ErrorCode.INTERNAL_ERROR)
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient(); 