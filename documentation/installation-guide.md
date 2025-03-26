# SCR Extraction Tool: Installation & Setup Guide

This guide provides detailed instructions for installing, configuring, and deploying the SCR Extraction Tool in various environments.

## Local Development Setup

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher (required for built-in fetch API support)
- **npm**: v8.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14.0 or higher
- **Git**: For version control

You'll also need accounts and API keys for:
- **OpenAI**: With access to Assistants API
- **Clerk**: For authentication

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-organization/scr-extraction-tool.git
cd scr-extraction-tool
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/scr_extraction"

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the placeholder values with your actual API keys and database connection string.

### Step 4: Set Up the Database

First, make sure your PostgreSQL server is running. Then initialize the database:

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
   - For the database, use a production PostgreSQL instance (e.g., Vercel Postgres, Supabase, or AWS RDS)

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
- Access to a PostgreSQL database

#### Step 1: Build the Docker Image

```bash
docker build -t scr-extraction-tool .
```

#### Step 2: Create a docker-compose.yml File

```yaml
version: '3'
services:
  app:
    image: scr-extraction-tool
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
      - CLERK_SECRET_KEY=sk_test_...
      - OPENAI_API_KEY=sk-...
      - DATABASE_URL=postgresql://username:password@db:5432/scr_extraction
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
      - POSTGRES_DB=scr_extraction
volumes:
  postgres_data:
```

Replace the placeholder values with your actual API keys and database credentials.

#### Step 3: Run with Docker Compose

```bash
docker-compose up -d
```

The application should now be running at `http://localhost:3000`.

### Option 3: Traditional Hosting

#### Prerequisites
- Node.js server (e.g., AWS EC2, DigitalOcean Droplet)
- Access to a PostgreSQL database
- Nginx or similar for reverse proxy (optional)

#### Step 1: Clone and Build the Application

```bash
# Clone the repository
git clone https://github.com/your-organization/scr-extraction-tool.git
cd scr-extraction-tool

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
pm2 start npm --name "scr-extraction" -- start
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

Save this to `/etc/nginx/sites-available/scr-extraction` and enable it:

```bash
ln -s /etc/nginx/sites-available/scr-extraction /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Database Setup

### Initial Setup

The application will automatically create the necessary database tables when you run `npx prisma db push`. However, there are some initial seed data you may want to add:

#### Setting Up Assistant Types

You'll need to create two assistant types in the database:

1. SCR Extraction Assistant
2. CSV Generation Assistant

These can be added through the application's admin interface or directly via the database.

### Database Backups

For production environments, set up regular backups of your PostgreSQL database:

```bash
# Example backup command
pg_dump -U username -d scr_extraction > backup_$(date +%Y%m%d).sql
```

Consider automating this with a cron job:

```
0 0 * * * pg_dump -U username -d scr_extraction > /path/to/backups/backup_$(date +%Y%m%d).sql
```

## OpenAI Setup

### Creating Assistants

The SCR Extraction Tool requires two specialized OpenAI assistants:

1. **SCR Data Extraction Assistant**
   - Create in OpenAI dashboard
   - Use GPT-4 model
   - Enable file capability
   - Add document understanding instructions

2. **CSV Generation Assistant**
   - Create in OpenAI dashboard
   - Use GPT-4 model
   - Add CSV formatting instructions

After creating these assistants, update the application configuration with their IDs.

## Clerk Authentication Setup

### Creating a Clerk Application

1. Sign up for a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure authentication methods (email, social logins, etc.)
4. Set allowed domains for your application
5. Copy the API keys to your environment variables

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

1. Check if PostgreSQL is running: `pg_isready`
2. Verify your DATABASE_URL is correct
3. Ensure database user has appropriate permissions

#### OpenAI API Issues

If you encounter OpenAI API errors:

1. Verify your API key is valid and has sufficient permissions
2. Check if you have billing set up on your OpenAI account
3. Ensure you have access to the Assistants API

#### Next.js Build Errors

If the build fails:

1. Clear the `.next` directory: `rm -rf .next`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`

### Getting Help

If you continue to experience issues:

1. Check the application logs for detailed error messages
2. Review the [technical documentation](technical-guide.md)
3. Reach out to the development team with specific error details 