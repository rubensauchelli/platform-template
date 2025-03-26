# SCR Extraction Tool: User Guide

## Introduction

The SCR Extraction Tool is a specialized application designed to streamline the process of extracting structured data from Summary Care Record (SCR) PDF documents and converting it into standardized CSV format. This guide provides detailed instructions on how to use the application effectively.

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- User account with appropriate permissions

### Accessing the Application
1. Navigate to the application URL in your web browser
2. Sign in using your credentials
3. You will be automatically redirected to the SCR Extraction page

## Core Functionality

The SCR Extraction Tool follows a simple four-step process:

1. **Upload** - Upload your SCR PDF file
2. **Extract** - Extract structured data from the PDF
3. **Process** - Convert the structured data to CSV format
4. **Download** - Download the resulting CSV file

## Detailed Workflow Guide

### Step 1: Uploading a PDF File

1. From the main dashboard, you'll see the SCR Extraction card.
2. Click on the **SCR Extraction** option in the sidebar.
3. On the SCR Extraction page, you'll see a file upload area.
4. Before uploading, ensure you have selected appropriate templates:
   - Click on the **Templates** button in the top-right corner of the card
   - Select an **Extraction Template** for PDF data extraction
   - Select a **CSV Template** for CSV generation
   - Both templates must be selected before uploading is enabled
5. Drag and drop your SCR PDF file into the designated area or click to browse your files.
6. The application will validate that:
   - The file is in PDF format
   - The file size does not exceed 20MB
7. Once a valid file is selected, the **Extract Data** button will become active.

### Step 2: Extracting and Processing Data

1. Click the **Extract Data** button to begin processing.
2. The application will display a progress indicator showing the current processing stage:
   - Uploading PDF File
   - Extracting Patient Data
   - Cleaning Up Original File
   - Generating CSV
3. The processing time will vary depending on the file size and complexity, typically taking 10-30 seconds.
4. During processing, you cannot upload additional files or make other changes.

### Step 3: Reviewing and Downloading Results

Once processing is complete, the application will display:

1. A success message indicating the extraction is complete
2. A summary of the extracted patient information including:
   - Patient name
   - NHS number
   - Date of birth
   - Additional demographic information
3. Two download options:
   - **Download CSV**: Downloads the formatted CSV file
   - **View JSON**: Displays the structured data in JSON format

4. To process another file, click the **Process New File** button at the bottom of the page.

## Template Management

The SCR Extraction Tool allows you to customize how data is extracted and formatted using templates.

### Default Templates

The application comes with default templates for both extraction and CSV generation. These templates are suitable for most standard SCR documents.

### Creating Custom Templates

1. Navigate to the **Templates** page using the sidebar.
2. Click the **New Template** button.
3. Fill in the template details:
   - **Title**: A descriptive name for your template
   - **Description**: Information about the template's purpose
   - **Model**: The OpenAI model to use (e.g., GPT-4)
   - **Assistant Type**: Select either "SCR Extraction" or "CSV Generation"
   - **Temperature**: Adjust the AI's creativity level (0-2)
   - **Instructions**: Detailed instructions for the AI
   - **Set as Default**: Whether this template should be the default for its type

4. Click **Save Template** to create your custom template.

### Managing Templates

1. On the Templates page, you can:
   - View all your templates
   - Edit existing templates
   - Delete templates
   - Set a template as the default for its type

2. To use a specific template during extraction:
   - Click the **Templates** button on the SCR Extraction page
   - Select your desired templates from the dropdown menus
   - Click **Save Selection**

## Troubleshooting

### Common Issues and Solutions

1. **File Upload Errors**
   - **Error**: "File too large"
     - **Solution**: Ensure your file is less than 20MB
   - **Error**: "Unsupported file type"
     - **Solution**: Only PDF files are supported

2. **Processing Errors**
   - **Error**: "Failed to extract data"
     - **Solution**: The PDF may be corrupted or have an unusual format. Try a different SCR document.
   - **Error**: "Processing timeout"
     - **Solution**: The system may be experiencing high load. Wait a moment and try again.

3. **Template Issues**
   - **Problem**: Custom template not working as expected
     - **Solution**: Review and refine the instructions, or try adjusting the temperature setting.

### Getting Help

If you encounter issues not covered in this guide:

1. Check the detailed error message for specific information
2. Refer to the application documentation
3. Contact your system administrator

## Security and Data Privacy

The SCR Extraction Tool prioritizes the security and privacy of patient data:

1. **Authentication**: All users must authenticate before accessing the application
2. **Data Protection**: SCR documents are temporarily stored and automatically deleted after processing
3. **Secure Processing**: All data is processed securely using OpenAI's protected environment
4. **User Scoping**: Files and templates are scoped to individual users for privacy

## Best Practices

1. **Optimal PDF Quality**: Use high-quality, clear PDF documents for best results
2. **Template Selection**: Choose the most appropriate templates for your specific SCR format
3. **Regular Updates**: Keep the application updated for the latest features and security improvements
4. **Data Verification**: Always verify the extracted data against the original SCR for accuracy

## FAQ

**Q: How long are my uploaded files stored?**
A: Files are temporarily stored in OpenAI's system and automatically deleted after processing is complete.

**Q: Can I extract data from multiple SCRs at once?**
A: Currently, the application processes one SCR document at a time.

**Q: Is there a limit to how many SCRs I can process?**
A: There are no specific limits, but processing may be subject to rate limiting during high usage periods.

**Q: Can I customize the CSV format?**
A: Yes, you can create custom CSV generation templates to adjust the format.

**Q: How secure is my patient data?**
A: All data is processed securely with encryption, authentication, and automatic cleanup procedures. 