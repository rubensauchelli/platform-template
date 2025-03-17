import { NextResponse } from 'next/server';
import { uploadPdfToOpenAI, OpenAIError } from '@/lib/openai';
import { HTTP_STATUS, ErrorCode, ApiResponse } from '@/types/api';

// Define the response type structure
type UploadResponseData = {
  fileId: string;
  filename: string;
  uploadedAt: string;
};

export async function POST(req: Request): Promise<NextResponse<ApiResponse<UploadResponseData>>> {
  console.log('📥 Upload request received');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    // Validate file presence and type
    if (!file || !(file instanceof File)) {
      console.error('❌ No file provided in request');
      return NextResponse.json({
        success: false,
        data: null,
        error: {
          message: 'No file provided',
          code: ErrorCode.UPLOAD_FAILED
        }
      }, { status: HTTP_STATUS.INVALID_FILE });
    }

    // Log file details
    console.log('📋 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Validate file type
    if (!file.type.includes('pdf')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json({
        success: false,
        data: null,
        error: {
          message: 'Only PDF files are allowed',
          code: ErrorCode.UPLOAD_FAILED
        }
      }, { status: HTTP_STATUS.INVALID_FILE });
    }

    console.log('🚀 Starting upload to OpenAI...');
    // Upload to OpenAI
    const { fileId } = await uploadPdfToOpenAI(file);
    console.log('✅ Upload successful - File ID:', fileId);

    return NextResponse.json({
      success: true,
      data: {
        fileId,
        filename: file.name,
        uploadedAt: new Date().toISOString()
      }
    }, { status: HTTP_STATUS.CREATED });

  } catch (error) {
    console.error('💥 Upload error:', error);

    if (error instanceof OpenAIError) {
      console.error('OpenAI API Error:', error.message);
      return NextResponse.json({
        success: false,
        data: null,
        error: {
          message: error.message,
          code: ErrorCode.UPLOAD_FAILED
        }
      }, { status: HTTP_STATUS.SERVER_ERROR });
    }

    return NextResponse.json({
      success: false,
      data: null,
      error: {
        message: 'Failed to upload file',
        code: ErrorCode.UPLOAD_FAILED
      }
    }, { status: HTTP_STATUS.SERVER_ERROR });
  }
}