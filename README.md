# Omniflo Platform Template

## Description
A modern web application template built with Next.js, featuring authentication, robust styling, and a serverless architecture. This template provides a solid foundation for building various web applications with a focus on scalability, security, and developer experience.

## Features
- **Authentication**: Secure user authentication via Clerk.
- **Modern UI**: Clean, responsive interface with customizable components using Shadcn UI.
- **Serverless Architecture**: Built for cloud deployment with optimal performance.
- **Type Safety**: Full TypeScript support throughout the codebase.
- **Database Integration**: Configured with Prisma ORM for flexible database operations.
- **API Framework**: Well-structured API routes for backend functionality.
- **OpenAI Integration**: Built-in utilities for working with OpenAI APIs.
- **Secure By Design**: Built with security best practices in mind.

> Note: While the codebase includes support for OpenAI integration and has structures for template workflows, some features mentioned in the documentation may require additional implementation to fully activate.

## Tech Stack
### **Frontend**
- **Framework**: Next.js 14+ + React 18
- **Styling**: Tailwind CSS 3 with customizable UI components (Shadcn UI)

### **Authentication**
- **Service**: Clerk (easily configurable)

### **Backend**
- **Framework**: Next.js API Routes
  - Enables serverless functions for backend operations

### **Database**
- **ORM**: Prisma 5+
  - Compatible with various database providers (PostgreSQL, MySQL, SQLite)

### **AI Integration**
- **Service**: OpenAI API v4 with built-in utility functions and types

### **Deployment**
- **Recommended**: Vercel
  - Other options: Netlify, AWS, GCP, or any platform supporting Node.js

## Project Structure

```
platform-template/
├── src/                    # Application source code
│   ├── app/                # Next.js app router structure
│   │   ├── (app)/         # Authenticated routes
│   │   ├── api/           # API endpoints
│   │   └── (auth)/        # Authentication routes
│   ├── components/        # React components
│   │   ├── ui/            # Shadcn UI components
│   │   └── [feature]/     # Feature-specific components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── api-client.ts  # API client
│   │   ├── integrations/  # Third-party integrations
│   │   └── db/            # Database operations
│   └── types/             # TypeScript types
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── documentation/         # Documentation files
├── public/                # Static assets
└── tests/                # Application tests
```

## Getting Started

1. **Clone the repository**:
```bash
git clone https://github.com/omniflo/platform-template.git
cd platform-template
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

> **IMPORTANT**: This template requires Clerk for authentication. You must provide the following environment variables for the application to function properly:
> - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
> - `CLERK_SECRET_KEY`: Your Clerk secret key
> - `CLERK_WEBHOOK_SECRET`: Your Clerk webhook secret (for user events)
>
> You can get these keys from the [Clerk Dashboard](https://dashboard.clerk.com).

4. **Initialize the database**:
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open [http://localhost:3000](http://localhost:3000)** with your browser to see the result.

## Configuration

### Authentication
Configure authentication by setting up your Clerk account or replacing with your preferred auth provider.

### Database
Update the Prisma schema in `prisma/schema.prisma` to match your data model requirements.

### Environment Variables
Set the required environment variables as specified in `.env.example`.

## Documentation
Additional documentation can be found in the `documentation/` directory:
- [API Reference](documentation/api-reference.md)
- [User Guide](documentation/user-guide.md)
- [Installation Guide](documentation/installation-guide.md)
- [Technical Guide](documentation/technical-guide.md)
- [Database Documentation](documentation/database-guide.md)
- [Frontend Documentation](documentation/frontend-guide.md)
- [Security Documentation](documentation/security-guide.md)
- [Contributing Guide](documentation/CONTRIBUTING.md)

## Security Considerations
- **Data Encryption**: All communications are secured using HTTPS.
- **Authentication**: Secure token-based authentication system.
- **Database Security**: Prisma ORM provides protection against SQL injection.
- **Input Validation**: All user inputs are validated before processing.

## Support and Contributing

For issues, feature requests, or contributions, please:

1. Check the documentation for answers to common questions
2. Submit detailed bug reports with steps to reproduce
3. Follow the contribution guidelines when submitting code

## License
MIT
