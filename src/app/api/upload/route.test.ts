import { NextResponse } from 'next/server';
import { uploadPdfToOpenAI } from '@/lib/openai';

// Jest will automatically use the mock from __mocks__/lib/openai.ts
jest.mock('@/lib/openai');

describe('Upload Route Handler', () => {
  // Clear mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
}); 