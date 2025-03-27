# Database Schema Documentation

The Omniflo Platform uses PostgreSQL as its primary database with Prisma ORM for type-safe database operations. This document outlines the database schema, relationships between models, and their purpose within the application.

## Database Technology

- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Connection**: Connection pooling for efficient resource usage
- **Migrations**: Managed through Prisma migrations

## Schema Overview

The database schema consists of several interconnected models that handle various aspects of the application:

1. **User**: Represents application users authenticated via Clerk
2. **Template**: Stores templates for different processing types
3. **TemplateType**: Defines the types of templates available (e.g., data-processing, data-export)
4. **TemplateTool**: Defines the tools available to each template type
5. **OpenAIModel**: Available OpenAI models that can be used with templates
6. **UserTemplateSelection**: Tracks which templates a user has selected for each template type

## Model Definitions

### User

Represents a user of the application. Users are created via Clerk authentication.

```prisma
model User {
  id         String                  @id @default(cuid())
  clerkId    String                  @unique
  createdAt  DateTime                @default(now())
  updatedAt  DateTime                @updatedAt
  templates  Template[]
  selections UserTemplateSelection[]
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `clerkId`: Unique identifier from Clerk authentication service
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated

**Relationships**:
- One-to-Many with `Template`: A user can create multiple templates
- One-to-Many with `UserTemplateSelection`: A user can select multiple templates for different template types

### Template

Represents a template with specific instructions for data processing.

```prisma
model Template {
  id              String                  @id @default(cuid())
  title           String
  description     String
  instructions    String
  userId          String
  templateTypeId  String
  isDefault       Boolean                 @default(false)
  modelId         String
  temperature     Float
  assistantId     String?
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  templateType    TemplateType            @relation(fields: [templateTypeId], references: [id])
  model           OpenAIModel             @relation(fields: [modelId], references: [id])
  user            User                    @relation(fields: [userId], references: [id])
  selections      UserTemplateSelection[]
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `title`: Title of the template
- `description`: Description of the template's purpose
- `instructions`: The actual instructions provided to the AI processing
- `userId`: Foreign key referencing the User who created the template
- `templateTypeId`: Foreign key referencing the TemplateType
- `isDefault`: Boolean indicating if this is a default template for its type
- `modelId`: Foreign key referencing the OpenAI model to use
- `temperature`: The temperature setting for the AI model (0.0-2.0)
- `assistantId`: Optional ID of the created OpenAI assistant (if using Assistants API)
- `createdAt`: Timestamp when the template was created
- `updatedAt`: Timestamp when the template was last updated

**Relationships**:
- Many-to-One with `User`: Each template belongs to a user
- Many-to-One with `TemplateType`: Each template is for a specific template type
- Many-to-One with `OpenAIModel`: Each template uses a specific OpenAI model
- One-to-Many with `UserTemplateSelection`: A template can be selected by multiple users

### TemplateType

Defines the types of templates available in the system.

```prisma
model TemplateType {
  id          String                  @id @default(cuid())
  name        String                  @unique
  description String
  createdAt   DateTime                @default(now())
  updatedAt   DateTime                @updatedAt
  tools       TemplateTool[]
  templates   Template[]
  selections  UserTemplateSelection[]
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `name`: Unique name of the template type (e.g., "data-processing", "data-export")
- `description`: Description of the template type's purpose
- `createdAt`: Timestamp when the template type was created
- `updatedAt`: Timestamp when the template type was last updated

**Relationships**:
- One-to-Many with `TemplateTool`: Each template type can have multiple tools
- One-to-Many with `Template`: Each template type can have multiple templates
- One-to-Many with `UserTemplateSelection`: Each template type can have multiple user selections

### TemplateTool

Represents tools available to each template type.

```prisma
model TemplateTool {
  id              String         @id @default(cuid())
  name            String
  type            OpenAIToolType
  description     String
  schema          Json?
  templateTypeId  String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  templateType    TemplateType   @relation(fields: [templateTypeId], references: [id])

  @@unique([name, type])
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `name`: Name of the tool
- `type`: Type of the tool from the OpenAIToolType enum
- `description`: Description of the tool's purpose
- `schema`: Optional JSON schema for function-type tools
- `templateTypeId`: Foreign key referencing the TemplateType
- `createdAt`: Timestamp when the tool was created
- `updatedAt`: Timestamp when the tool was last updated

**Relationships**:
- Many-to-One with `TemplateType`: Each tool belongs to a template type

### OpenAIModel

Represents available OpenAI models that can be used with templates.

```prisma
model OpenAIModel {
  id          String     @id @default(cuid())
  openAIId    String     @unique
  name        String
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  templates   Template[]
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `openAIId`: Unique ID used by OpenAI (e.g., "gpt-4o", "gpt-3.5-turbo")
- `name`: Human-readable name for the model
- `description`: Optional description of the model's capabilities
- `createdAt`: Timestamp when the model record was created
- `updatedAt`: Timestamp when the model record was last updated

**Relationships**:
- One-to-Many with `Template`: Each model can be used by multiple templates

### UserTemplateSelection

Tracks which templates a user has selected for each template type.

```prisma
model UserTemplateSelection {
  id              String        @id @default(cuid())
  userId          String
  templateId      String
  templateTypeId  String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  templateType    TemplateType  @relation(fields: [templateTypeId], references: [id])
  template        Template      @relation(fields: [templateId], references: [id])
  user            User          @relation(fields: [userId], references: [id])

  @@unique([userId, templateTypeId])
}
```

**Fields**:
- `id`: Primary key, auto-generated CUID
- `userId`: Foreign key referencing the User
- `templateId`: Foreign key referencing the selected Template
- `templateTypeId`: Foreign key referencing the TemplateType
- `createdAt`: Timestamp when the selection was created
- `updatedAt`: Timestamp when the selection was last updated

**Relationships**:
- Many-to-One with `User`: Each selection belongs to a user
- Many-to-One with `Template`: Each selection references a template
- Many-to-One with `TemplateType`: Each selection is for a specific template type

**Constraints**:
- Unique constraint on `userId` and `templateTypeId` to ensure a user can only have one active template per template type

## Enums

### OpenAIToolType

Defines the types of tools available for OpenAI integrations.

```prisma
enum OpenAIToolType {
  file_search
  code_interpreter
  function
}
```

**Values**:
- `file_search`: Tool for searching and analyzing files
- `code_interpreter`: Python interpreter for code execution and data analysis
- `function`: Custom function with defined schema

## Database Operations

### Prisma Client Usage

The application uses Prisma Client for type-safe database operations. Here are some key operations with real examples:

#### User Operations

```typescript
// Get internal user ID from Clerk ID
export async function getInternalUserId(clerkId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.id
}
```

#### Template Operations

```typescript
// Get all templates with related data
export async function getTemplates(): Promise<Template[]> {
  const templates = await prisma.template.findMany({
    include: {
      templateType: true,
      user: true,
      model: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return templates.map(mapTemplateToResponse)
}

// Get a specific template by ID
export async function getTemplateById(id: string, userId?: string): Promise<Template | null> {
  const template = await prisma.template.findFirst({
    where: { 
      id
    },
    include: {
      templateType: true,
      user: true,
      model: true
    }
  })

  return template ? mapTemplateToResponse(template) : null
}

// Create a new template
export async function createTemplate(data: CreateTemplateRequest, userId: string): Promise<Template> {
  // Get the model ID from the OpenAI ID
  const model = await prisma.openAIModel.findUnique({
    where: { openAIId: data.model }
  })

  if (!model) {
    throw new Error(`Model ${data.model} not found`)
  }

  // Get the template type ID and tools
  const templateType = await prisma.templateType.findUnique({
    where: { name: data.templateType },
    include: { tools: true }
  })

  if (!templateType) {
    throw new Error(`Template type ${data.templateType} not found`)
  }

  // Create OpenAI assistant
  const assistant = await createAssistant({
    name: data.title,
    instructions: data.instructions,
    model: data.model,
    tools: templateType.tools.map(convertToolToOpenAIFormat),
    temperature: data.temperature
  });

  // If setting as default, unset any existing default for this template type
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: {
        templateTypeId: templateType.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    })
  }

  // Create the template
  const template = await prisma.template.create({
    data: {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      temperature: data.temperature,
      isDefault: data.isDefault,
      assistantId: assistant.id,
      model: {
        connect: { id: model.id }
      },
      user: {
        connect: { id: userId }
      },
      templateType: {
        connect: { id: templateType.id }
      }
    },
    include: {
      model: true,
      templateType: true,
      user: true
    }
  })

  return mapTemplateToResponse(template)
}

// Update a template
export async function updateTemplate(id: string, data: Partial<CreateTemplateRequest>): Promise<Template> {
  // First get the current template
  const currentTemplate = await prisma.template.findUnique({
    where: { id },
    include: { 
      templateType: {
        include: { tools: true }
      },
      model: true
    }
  })

  if (!currentTemplate) {
    throw new Error(`Template ${id} not found`)
  }

  let templateTypeId: string | undefined
  let modelId: string | undefined
  let templateTools = currentTemplate.templateType.tools

  // If changing template type, get its ID and tools
  if (data.templateType) {
    const templateType = await prisma.templateType.findUnique({
      where: { name: data.templateType },
      include: { tools: true }
    })
    if (!templateType) {
      throw new Error(`Template type ${data.templateType} not found`)
    }
    templateTypeId = templateType.id
    templateTools = templateType.tools
  }

  // If changing model, get its ID
  if (data.model) {
    const model = await prisma.openAIModel.findUnique({
      where: { openAIId: data.model }
    })
    if (!model) {
      throw new Error(`Model ${data.model} not found`)
    }
    modelId = model.id
  }

  // Update OpenAI assistant if needed
  if (currentTemplate.assistantId && (data.title || data.instructions || data.model || data.temperature !== undefined || data.templateType)) {
    await updateAssistant(currentTemplate.assistantId, {
      name: data.title || currentTemplate.title,
      instructions: data.instructions || currentTemplate.instructions,
      model: data.model || currentTemplate.model.openAIId,
      tools: templateTools.map(convertToolToOpenAIFormat),
      temperature: data.temperature !== undefined ? data.temperature : currentTemplate.temperature
    });
  }

  // If setting as default, unset any existing default for this template type
  if (data.isDefault) {
    await prisma.template.updateMany({
      where: {
        templateTypeId: currentTemplate.templateType.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    })
  }

  // Update the template in the database
  const template = await prisma.template.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.instructions && { instructions: data.instructions }),
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(templateTypeId && { templateTypeId }),
      ...(modelId && { modelId })
    },
    include: {
      templateType: true,
      user: true,
      model: true
    }
  })

  return mapTemplateToResponse(template)
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  try {
    // First, delete any template selections
    await prisma.userTemplateSelection.deleteMany({
      where: { templateId: id }
    })

    // Then delete the template itself
    await prisma.template.delete({
      where: { id }
    })
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw error;
  }
}
```

#### User Template Selection

```typescript
// Update or create a user's template selection
export async function updateTemplateSelection(
  userId: string, 
  templateTypeId: string,
  templateId: string
): Promise<SelectionWithRelations> {
  return prisma.userTemplateSelection.upsert({
    where: {
      userId_templateTypeId: {
        userId,
        templateTypeId
      }
    },
    update: {
      templateId
    },
    create: {
      userId,
      templateTypeId,
      templateId
    },
    include: {
      template: {
        include: {
          templateType: true,
          user: true,
          model: true
        }
      },
      templateType: true
    }
  })
}
```

#### OpenAI Models

```typescript
// Get all available models
export async function getModels(): Promise<OpenAIModel[]> {
  return prisma.openAIModel.findMany({
    orderBy: { name: 'asc' }
  });
}

// Import a model from OpenAI into our database
export async function importModel(openAIId: string): Promise<OpenAIModel> {
  // Get model details from OpenAI
  const openAIModel = await getModel(openAIId);
  
  // Create or update model in our database
  return prisma.openAIModel.upsert({
    where: { openAIId },
    update: {
      name: openAIModel.id,
      description: `OpenAI ${openAIModel.id} model`,
    },
    create: {
      openAIId: openAIModel.id,
      name: openAIModel.id,
      description: `OpenAI ${openAIModel.id} model`,
    },
  });
}

// Remove a model if it's not in use
export async function removeModel(id: string): Promise<void> {
  // Check if model is in use by any templates
  const templatesUsingModel = await prisma.template.findMany({
    where: { modelId: id },
    select: { id: true }
  });

  if (templatesUsingModel.length > 0) {
    throw new Error('Cannot remove model that is in use by templates');
  }

  await prisma.openAIModel.delete({
    where: { id }
  });
}
```

### Transactions

For operations that require multiple database changes, Prisma's transaction support ensures data integrity:

```typescript
// Example of using a transaction when creating a template and setting it as the default
export async function createTemplateAndSetAsDefault(data: CreateTemplateRequest, userId: string): Promise<Template> {
  return prisma.$transaction(async (tx) => {
    // Step 1: If setting as default, unset any existing defaults
    if (data.isDefault) {
      const templateType = await tx.templateType.findUnique({
        where: { name: data.templateType }
      });
      
      if (templateType) {
        await tx.template.updateMany({
          where: {
            templateTypeId: templateType.id,
            isDefault: true
          },
          data: {
            isDefault: false
          }
        });
      }
    }
    
    // Step 2: Create the new template
    // Template creation logic...
    
    // Step 3: Update user's selection to point to the new template
    // Selection update logic...
    
    return newTemplate;
  });
}
```

### Migrations

Database schema changes are managed through Prisma Migrations:

1. Edit the `schema.prisma` file
2. Generate the migration: `npx prisma migrate dev --name migration_name`
3. Apply the migration: `npx prisma migrate deploy`

The project maintains a history of migrations in the `prisma/migrations` directory, allowing for version control and consistent database schema evolution.

## Indexing Strategy

The schema includes the following key indexes:

1. Primary keys on all tables (`id` fields)
2. Unique index on `User.clerkId` for quick Clerk ID lookups
3. Unique index on `TemplateType.name` for fast type lookups
4. Unique composite index on `[userId, templateTypeId]` in UserTemplateSelection
5. Unique composite index on `[name, type]` in TemplateTool
6. Unique index on `OpenAIModel.openAIId` for efficient model lookups

## Database Maintenance

### Connection Pooling

The application uses Prisma's connection pooling to efficiently manage database connections:

```typescript
// From src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

This implementation ensures that:
1. Only one Prisma Client instance is created in development mode
2. Connection pooling efficiently manages database connections
3. Resources are properly reused across serverless function invocations

### Backups

The database is backed up daily with a 14-day retention policy using PostgreSQL's native backup mechanisms. Critical operations are logged to ensure data recoverability.

### Cleanup Jobs

Scheduled maintenance jobs include:

1. **Orphaned Records**: Regular cleanup of records without parent relationships
2. **Assistant Synchronization**: Ensuring OpenAI assistants match database templates
3. **Performance Monitoring**: Tracking query performance and optimizing as needed

## Future Schema Enhancements

1. **File Processing Records**: Add tracking for processed files and their extraction results
   ```prisma
   model FileProcessingRecord {
     id             String    @id @default(cuid())
     filename       String
     userId         String
     openAIFileId   String    // OpenAI file ID
     status         String    // 'uploading', 'processing', 'completed', 'failed'
     processingTime Int?      // Processing time in ms
     errorMessage   String?   // Error message if status is 'failed'
     templateId     String    // Template used for processing
     createdAt      DateTime  @default(now())
     updatedAt      DateTime  @updatedAt
     template       Template  @relation(fields: [templateId], references: [id])
     user           User      @relation(fields: [userId], references: [id])
     results        Json?     // Extracted data results
   }
   ```

2. **Usage Statistics**: Track template and model performance metrics
   ```prisma
   model UsageStatistic {
     id          String    @id @default(cuid())
     templateId  String
     userId      String
     modelId     String
     timestamp   DateTime  @default(now())
     duration    Int       // Processing time in ms
     tokenCount  Int       // Total tokens used
     success     Boolean   @default(true)
     template    Template  @relation(fields: [templateId], references: [id])
     user        User      @relation(fields: [userId], references: [id])
     model       OpenAIModel @relation(fields: [modelId], references: [id])
   }
   ```

3. **API Keys**: Enable user-specific API key management
   ```prisma
   model ApiKey {
     id            String    @id @default(cuid())
     userId        String
     name          String    // Human-readable name for the key
     key           String    @unique // Encrypted key value
     lastUsed      DateTime?
     expiresAt     DateTime?
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
     user          User      @relation(fields: [userId], references: [id])
     
     @@index([userId])
   }
   ```

4. **Organization Support**: Add multi-tenant support
   ```prisma
   model Organization {
     id          String    @id @default(cuid())
     name        String
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
     members     OrganizationMember[]
     templates   Template[]
   }
   
   model OrganizationMember {
     id             String       @id @default(cuid())
     userId         String
     organizationId String
     role           String       // 'admin', 'member', 'viewer'
     createdAt      DateTime     @default(now())
     updatedAt      DateTime     @updatedAt
     user           User         @relation(fields: [userId], references: [id])
     organization   Organization @relation(fields: [organizationId], references: [id])
     
     @@unique([userId, organizationId])
   }
   ``` 