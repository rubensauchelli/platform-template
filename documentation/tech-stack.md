# Tech Stack for Platform Template

## **Frontend**
- **Framework**: Next.js (stable version 14) + React
  - Modern, server-side rendering and static generation capabilities
  - Fast, responsive user experience
  - Built-in API routes
- **Styling**: Shadcn UI (Tailwind CSS)
  - Pre-built and accessible components for a consistent design
  - Highly customizable design system
  - Dark/light mode support

## **Authentication**
- **Service**: Clerk
  - Complete user management solution
  - Supports multiple authentication methods
  - Secure session management

## **Backend**
- **Framework**: Next.js App Router API Routes
  - Enables serverless APIs hosted on Vercel
  - Implements RESTful endpoints
  - Robust error handling with standardized HTTP status codes
  - Uses TypeScript for type safety and better developer experience

## **Database**
- **ORM**: Prisma
  - Type-safe database client
  - Supports PostgreSQL and other databases
  - Schema migrations and seeding
  - Efficient queries with relation handling

## **AI Integration (Optional)**
- **Provider**: OpenAI API
  - Ready-to-use integration with OpenAI services
  - Support for various AI models and features
  - Extensible architecture for custom AI integrations

## **Hosting**
- **Platform**: Vercel
  - Deploys both frontend and backend with built-in HTTPS
  - Ensures scalability and reliability
  - CI/CD integration
  - Edge network for fast global delivery