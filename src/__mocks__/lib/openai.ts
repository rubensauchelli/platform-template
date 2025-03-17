import { jest } from '@jest/globals';

export const uploadPdfToOpenAI = jest.fn();

const openaiMock = {
  uploadPdfToOpenAI
};

export default openaiMock; 