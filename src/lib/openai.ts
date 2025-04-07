import { OpenAI } from 'openai';
import { isValidCsv } from './utils';
import { prisma } from '@/lib/db';

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Custom error class for OpenAI operations
 * Includes a status code for HTTP responses
 */
export class OpenAIError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * Model Management
 * Syncs available models from OpenAI and stores them in our database
 */
export async function syncModels() {
  try {
    const response = await openai.models.list();
    return response.data;
  } catch (error) {
    console.error('Error syncing models:', error);
    throw new OpenAIError('Failed to sync models from OpenAI', 500);
  }
}

/**
 * Assistant Management
 * Functions to create, update, delete, and get assistants
 */
export async function createAssistant(params: Parameters<typeof openai.beta.assistants.create>[0]) {
  try {
    return await openai.beta.assistants.create(params);
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw new OpenAIError('Failed to create assistant', 500);
  }
}

export async function updateAssistant(
  assistantId: string,
  params: Parameters<typeof openai.beta.assistants.update>[1]
) {
  try {
    return await openai.beta.assistants.update(assistantId, params);
  } catch (error) {
    console.error('Error updating assistant:', error);
    throw new OpenAIError('Failed to update assistant', 500);
  }
}

export async function deleteAssistant(assistantId: string) {
  try {
    return await openai.beta.assistants.del(assistantId);
  } catch (error) {
    console.error('Error deleting assistant:', error);
    throw new OpenAIError('Failed to delete assistant', 500);
  }
}

export async function getAssistant(assistantId: string) {
  try {
    return await openai.beta.assistants.retrieve(assistantId);
  } catch (error) {
    console.error('Error retrieving assistant:', error);
    throw new OpenAIError('Failed to retrieve assistant', 500);
  }
}

/**
 * Function to convert a tool definition to the format expected by OpenAI
 */
type FunctionDefinition = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
  strict?: boolean;
};

type OpenAITool = 
  | { type: 'code_interpreter' | 'file_search' }
  | { type: 'function'; function: FunctionDefinition };

export function convertToolToOpenAIFormat(tool: {
  type: string;
  name: string;
  description: string;
  schema?: any;
}): OpenAITool {
  if (tool.type === 'code_interpreter' || tool.type === 'file_search') {
    return { type: tool.type as 'code_interpreter' | 'file_search' };
  }
  
  if (tool.type === 'function' && tool.schema) {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema.parameters,
        strict: tool.schema.strict,
      },
    };
  }
  
  throw new OpenAIError(`Invalid tool type: ${tool.type}`, 400);
}

/**
 * File Management
 * Functions to upload, delete, and list files
 */
export type UploadResponse = { fileId: string };

export async function uploadFileToOpenAI(file: File): Promise<UploadResponse> {
  try {
    const response = await openai.files.create({
      file,
      purpose: 'assistants',
    });
    
    return { fileId: response.id };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new OpenAIError('Failed to upload file', 500);
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  try {
    await openai.files.del(fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new OpenAIError('Failed to delete file', 500);
  }
}

export async function listFiles(): Promise<{ data: Array<{ id: string; filename: string }> }> {
  try {
    const response = await openai.files.list();
    return {
      data: response.data.map(file => ({
        id: file.id,
        filename: file.filename,
      })),
    };
  } catch (error) {
    console.error('Error listing files:', error);
    throw new OpenAIError('Failed to list files', 500);
  }
}

/**
 * Thread Management
 * Functions to create threads and manage messages
 */
export async function createThread() {
  try {
    return await openai.beta.threads.create();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new OpenAIError('Failed to create thread', 500);
  }
}

export async function addMessage(threadId: string, content: string, fileIds?: string[]) {
  try {
    const messageData: {
      role: 'user';
      content: string;
      attachments?: Array<{type: 'file_attachment', file_id: string}>;
    } = {
      role: 'user',
      content,
    };
    
    // Use the attachments field instead of file_ids for OpenAI API v4
    if (fileIds && fileIds.length > 0) {
      messageData.attachments = fileIds.map(id => ({
        type: 'file_attachment',
        file_id: id
      }));
    }
    
    return await openai.beta.threads.messages.create(threadId, messageData);
  } catch (error) {
    console.error('Error adding message:', error);
    throw new OpenAIError('Failed to add message', 500);
  }
}

/**
 * Run Management
 * Functions to run assistants and get results
 */
export async function runAssistant(threadId: string, assistantId: string) {
  try {
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new OpenAIError('Failed to run assistant', 500);
  }
}

export async function getRunStatus(threadId: string, runId: string) {
  try {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  } catch (error) {
    console.error('Error getting run status:', error);
    throw new OpenAIError('Failed to get run status', 500);
  }
}

export async function listAvailableModels() {
  try {
    const response = await openai.models.list();
    return response.data;
  } catch (error) {
    console.error('Error listing models:', error);
    throw new OpenAIError('Failed to list models', 500);
  }
}

export async function getModel(modelId: string) {
  try {
    return await openai.models.retrieve(modelId);
  } catch (error) {
    console.error('Error retrieving model:', error);
    throw new OpenAIError('Failed to retrieve model', 500);
  }
} 