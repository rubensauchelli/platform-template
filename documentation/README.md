# SCR Extraction Tool Documentation

Welcome to the SCR Extraction Tool documentation. This comprehensive guide provides everything you need to install, configure, use, and maintain the SCR Extraction Tool.

## Documentation Overview

### For Users

- [**User Guide**](user-guide.md): Detailed instructions on how to use the application, including uploading SCRs, managing templates, and extracting structured data.

### For Administrators & DevOps

- [**Installation Guide**](installation-guide.md): Step-by-step instructions for installing and deploying the application in various environments.
- [**Security Documentation**](security-guide.md): Comprehensive information about security features, authentication, data protection, and compliance requirements.

### For Developers

- [**Technical Guide**](technical-guide.md): In-depth technical information about the architecture, integration with OpenAI, and implementation details.
- [**Database Documentation**](database-guide.md): Detailed schema information, relationships, database operations, and maintenance guides.
- [**Frontend Documentation**](frontend-guide.md): Information about the frontend architecture, components, state management, and accessibility implementation.
- [**API Reference**](api-reference.md): Complete API documentation with endpoints, request/response formats, error handling, and usage examples.

## Project Structure

The SCR Extraction Tool is built with a modern tech stack:

```
scr-extraction-tool/
├── src/                    # Application source code
│   ├── app/                # Next.js app router structure
│   │   ├── (app)/         # Authenticated routes
│   │   ├── api/           # API endpoints
│   │   └── auth/          # Authentication routes
│   ├── components/        # React components
│   │   ├── ui/            # Shadcn UI components
│   │   └── [feature]/     # Feature-specific components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── api-client.ts  # API client
│   │   ├── openai.ts      # OpenAI integration
│   │   └── db/            # Database operations
│   └── types/             # TypeScript types
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── documentation/         # Documentation files
├── public/                # Static assets
└── tests/                # Application tests
```

## About SCR Extraction Tool

The SCR Extraction Tool is a specialized application designed to extract structured data from Summary Care Record (SCR) PDF documents and convert it into standardized CSV format for clinical systems. It leverages OpenAI's Assistants API for powerful document understanding and data extraction capabilities.

### Key Features

- **Intelligent Data Extraction**: Extracts structured patient data from SCR PDF documents using AI
- **Customizable CSV Generation**: Converts extracted data into configurable CSV formats
- **Template Management**: Customizable templates for both extraction and CSV generation processes
- **Model Selection**: Support for multiple OpenAI models with configurable parameters
- **User Management**: Secure multi-user support with Clerk authentication
- **Role-Based Access**: Granular control over user permissions and template access
- **File Security**: Temporary file storage with automatic cleanup
- **Responsive UI**: Modern interface that works across desktop and mobile devices
- **Accessibility**: WCAG-compliant interface with keyboard navigation and screen reader support

## Technical Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: OpenAI Assistants API
- **Deployment**: Vercel (recommended) or Docker

## Getting Started

To get started quickly, follow these steps:

1. Ensure you have the prerequisites:
   - Node.js 18 or higher
   - PostgreSQL 14 or higher
   - OpenAI API key with Assistants API access
   - Clerk account for authentication

2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-org/scr-extraction-tool.git
   cd scr-extraction-tool
   npm install
   ```

3. Set up your environment variables:
   ```
   # .env.local
   DATABASE_URL="postgresql://user:password@localhost:5432/scr_extraction"
   OPENAI_API_KEY="your-openai-api-key"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` to access the application

## Support and Contributing

For issues, feature requests, or contributions, please:

1. Check the documentation for answers to common questions
2. Submit detailed bug reports with steps to reproduce
3. Follow the contribution guidelines when submitting code

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

&copy; 2025 Omniflo Health. All rights reserved. 