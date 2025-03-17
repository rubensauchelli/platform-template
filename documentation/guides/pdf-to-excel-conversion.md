# Guide: Implementing PDF to Excel Conversion

This guide provides step-by-step instructions for adding a tool to convert PDFs to Excel files using OpenAI's API. The converted content (CSV) will be downloadable for users. This guide assumes familiarity with Next.js, TypeScript, and integration with REST APIs.

---

## **Overview**
The feature enables users to upload PDFs, process them with AI to extract structured data, and download the resulting CSV file. Users will have progress feedback throughout the process.

### Key Features:
1. **Backend**: Implements endpoints for file upload, processing via OpenAI's API, and CSV download.
2. **Environment Configuration**: Securely use the OpenAI API key with `.env`.

For now, this guide centers the backend implementation only. The workflow supports frontend integration, such as triggering the upload and download actions, which will be detailed in a future guide.

---

## **Directory Structure**
Make sure your project's directory structure looks like this:

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts
│   │   ├── process/
│   │   │   └── route.ts
│   │   └── download/
│   │       └── route.ts
│   ├── components/
│   │   └── FileUpload.tsx
│   ├── lib/
│   │   └── utils.ts          # (Optional: Common utilities)
|   ├── hooks/
│   │   └── use-user.ts       # (Optional: Your custom hooks)
├── .env                       # Store API environment variables
```

---

## **1. Backend Implementation**

### **1.1 File Upload Endpoint**
This endpoint accepts an uploaded PDF and stores it temporarily in memory.

**Path:** `src/app/api/upload/route.ts`

```typescript
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileId = Date.now().toString(); // Create a unique ID for the file.
    globalThis[fileId] = Buffer.from(await file.arrayBuffer()); // Store file in memory.

    return NextResponse.json({ success: true, fileId });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
};
```

---

### **1.2 File Processing Endpoint**
This endpoint sends the uploaded file to OpenAI's API (for GPT-4 or similar). The response is processed to extract structured data, which is then saved as a CSV.

**Path:** `src/app/api/process/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Get API key from environment.
});
const openai = new OpenAIApi(configuration);

export const POST = async (req: Request) => {
  try {
    const { fileId } = await req.json();
    const fileBuffer = globalThis[fileId]; // Retrieve file from in-memory storage.

    if (!fileBuffer) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-4-code-interpreter',
      messages: [
        {
          role: 'system',
          content: `Extract structured data from this PDF and convert to CSV format.`,
        },
      ],
      files: [
        { name: `${fileId}.pdf`, buffer: fileBuffer },
      ],
    });

    const csvContent = response.data.files[0].content; // Extract CSV from OpenAI response.
    globalThis[`${fileId}-csv`] = csvContent; // Store the generated CSV alongside file ID.

    return NextResponse.json({ success: true, csvFileId: `${fileId}-csv` });
  } catch (error) {
    console.error('Processing Error:', error);
    return NextResponse.json({ error: 'File processing failed' }, { status: 500 });
  }
};
```

---

### **1.3 CSV Download Endpoint**
This endpoint enables users to download the processed CSV file.

**Path:** `src/app/api/download/route.ts`

```typescript
export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId'); // Retrieve file ID from request query.
    const csvContent = globalThis[fileId];

    if (!csvContent) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="output.csv"',
      },
    });
  } catch (error) {
    console.error('Download Error:', error);
    return NextResponse.json({ error: 'CSV download failed' }, { status: 500 });
  }
};
```

---

## **2. Backend Implementation - Workflow Overview**

Here is an overview of the three backend steps for processing a PDF and generating a downloadable CSV:

1. **File Upload**: Users upload a PDF through the `upload` endpoint. This file is stored securely using OpenAI's `/v1/files` API for further processing.
2. **PDF Processing to CSV**: Use the `process` endpoint to send the uploaded file's `file_id` to OpenAI's Assistant API. The response will include the generated CSV data.
3. **CSV Download**: A `download` endpoint allows the user to download the CSV generated in the previous step, which is stored temporarily on the backend.

These steps form the foundation for integrating with a frontend. For now, the frontend can simply handle initiating these steps sequentially.

---

## **3. Environment Configuration**

Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=your-openai-api-key
```

---

## **4. Testing and Deployment**

1. Ensure your `.env` file is correctly configured.
2. Use `npm run build` to bundle the application for production.
3. Deploy your application (e.g., on **Vercel**).
4. Test with sample PDFs for end-to-end functionality.

---

By following this guide, your project will support PDF-to-CSV conversion using an AI-powered backend. Let me know if any additional optimizations are required!