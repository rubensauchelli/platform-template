# Installation & Setup Guide

This guide provides detailed instructions for installing, configuring, and deploying the application in various environments.

## Local Development Setup

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher (required for built-in fetch API support)
- **npm**: v8.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14.0 or higher (if using PostgreSQL as your database)
- **Git**: For version control

You'll also need accounts and API keys for (optional, depending on features you want to use):
- **AI Provider**: For AI integration features (e.g., OpenAI, Azure OpenAI)
- **Authentication Provider**: For user authentication (e.g., Clerk, Auth.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/organization/project-name.git
cd project-name
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory using the provided example:

```bash
cp .env.example .env.local
```

Then edit `.env.local` to include the necessary environment variables:

```
# Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Integration (if using OpenAI)
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the placeholder values with your actual API keys and database connection string.

### Step 4: Set Up the Database

First, make sure your database server is running. Then initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

### Step 5: Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`.

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- Access to your project repository

#### Deployment Steps

1. **Create a New Project on Vercel**
   - Connect to your Git repository
   - Select the project repository

2. **Configure Environment Variables**
   - Add all the same environment variables from your local `.env.local` file
   - For the database, use a production database instance (e.g., Vercel Postgres, Neon, Supabase, or AWS RDS)

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy the Application**
   - Click "Deploy" and wait for the build to complete
   - Vercel will provide a URL for your deployed application

5. **Set Up Custom Domain (Optional)**
   - In Vercel project settings, go to "Domains"
   - Add your custom domain and follow the verification process

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- Access to a database server

#### Step 1: Build the Docker Image

```bash
docker build -t project-name .
```

#### Step 2: Create a docker-compose.yml File

```yaml
version: '3'
services:
  app:
    image: project-name
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
      - CLERK_SECRET_KEY=sk_test_...
      - OPENAI_API_KEY=sk-...
      - DATABASE_URL=postgresql://username:password@db:5432/database_name
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      - db
  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=your_password
      - POSTGRES_USER=username
      - POSTGRES_DB=database_name
volumes:
  postgres_data:
```

Replace the placeholder values with your actual configuration.

#### Step 3: Run with Docker Compose

```bash
docker-compose up -d
```

The application should now be running at `http://localhost:3000`.

### Option 3: Traditional Hosting

#### Prerequisites
- Node.js server (e.g., AWS EC2, DigitalOcean Droplet, Azure VM)
- Access to a database server
- Nginx or similar for reverse proxy (optional)

#### Step 1: Clone and Build the Application

```bash
# Clone the repository
git clone https://github.com/organization/project-name.git
cd project-name

# Install dependencies
npm install

# Build the application
npm run build
```

#### Step 2: Set Up Environment Variables

Create a `.env.production` file with your production variables.

#### Step 3: Start the Application

For a production environment, you can use PM2 to manage the Node.js process:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "project-name" -- start
```

#### Step 4: Configure Nginx (Optional)

If you're using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save this to `/etc/nginx/sites-available/project-name` and enable it:

```bash
ln -s /etc/nginx/sites-available/project-name /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Database Setup

### Initial Setup

The application will automatically create the necessary database tables when you run `npx prisma db push`. For a production environment, you should use proper migrations:

```bash
npx prisma migrate dev --name init
```

### Seeding the Database (Optional)

If your application requires initial data, you can create a seed script in `prisma/seed.ts` and run it with:

```bash
npx prisma db seed
```

### Database Backups

For production environments, set up regular backups of your database:

```bash
# Example backup command for PostgreSQL
pg_dump -U username -d database_name > backup_$(date +%Y%m%d).sql
```

Consider automating this with a cron job:

```
0 0 * * * pg_dump -U username -d database_name > /path/to/backups/backup_$(date +%Y%m%d).sql
```

## Third-Party Service Setup

### AI Integration (Optional)

If you're using AI integration features, you'll need to configure your AI provider:

1. **Create an Account**
   - Sign up at the AI provider's platform (e.g., [platform.openai.com](https://platform.openai.com))
   - Set up billing for API access

2. **Generate an API Key**
   - Go to API Keys section in your provider's dashboard
   - Create a new API key and copy it
   - Add the key to your environment variables (e.g., `OPENAI_API_KEY`)

3. **Configure AI Models**
   - The application supports various models depending on your provider
   - Models can be selected based on performance and cost requirements

### Authentication Setup (Optional)

If you're using Clerk for authentication:

1. Sign up for a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure authentication methods (email, social logins, etc.)
4. Set allowed domains for your application
5. Copy the API keys to your environment variables

If using a different authentication provider, follow their specific setup instructions.

## Maintenance Tasks

### Regular Updates

Keep the application updated by periodically pulling the latest changes and rebuilding:

```bash
git pull
npm install
npm run build
```

### Database Migrations

When the database schema changes, apply migrations:

```bash
npx prisma migrate dev --name describe_changes
```

In production:

```bash
npx prisma migrate deploy
```

## Troubleshooting

### Common Installation Issues

#### Database Connection Errors

If you see errors connecting to the database:

1. Check if your database server is running
2. Verify your DATABASE_URL is correct
3. Ensure database user has appropriate permissions
4. Check firewall rules if connecting to a remote database

#### API Integration Issues

If you encounter API errors with third-party services:

1. Verify your API key is valid and has sufficient permissions
2. Check if you have billing set up on your provider account
3. Ensure you have access to the required services/models
4. Check API rate limits and quotas

#### Next.js Build Errors

If the build fails:

1. Clear the `.next` directory: `rm -rf .next`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`
4. Verify your Node.js version meets the requirements

### Getting Help

If you continue to experience issues:

1. Check the application logs for detailed error messages
2. Review the project documentation
3. Check for known issues in the repository's issue tracker
4. Reach out to the development team with specific error details 