# Assistant Instruction Management System

This document outlines the system design for managing custom instructions for our SCR Data Extraction and CSV Generation assistants using Prisma as the ORM.

## Database Schema

```prisma
// schema.prisma

model AssistantType {
  id          String      @id @default(cuid())
  name        String      // e.g., "SCR Data Extraction", "CSV Generation"
  description String
  templates   Template[]
  selections  UserTemplateSelection[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Template {
  id             String        @id @default(cuid())
  name           String
  description    String
  instructions   String        @db.Text
  isPublic       Boolean       @default(false)
  version        Int          @default(1)
  assistantType  AssistantType @relation(fields: [typeId], references: [id])
  typeId         String
  user           User          @relation(fields: [userId], references: [id])
  userId         String
  selections     UserTemplateSelection[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  usageCount     Int          @default(0)
  isActive       Boolean       @default(true)
  metadata       Json?         // For storing template-specific configurations
}

model User {
  id            String     @id @default(cuid())
  clerkId       String     @unique
  templates     Template[]
  selections    UserTemplateSelection[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// New model to track active template selections
model UserTemplateSelection {
  id              String        @id @default(cuid())
  user            User          @relation(fields: [userId], references: [id])
  userId          String
  template        Template      @relation(fields: [templateId], references: [id])
  templateId      String
  assistantType   AssistantType @relation(fields: [assistantTypeId], references: [id])
  assistantTypeId String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([userId, assistantTypeId])  // Ensures one active template per assistant type per user
}
```

## API Endpoints

### Template Management

#### Create Template
```typescript
POST /api/templates
{
  name: string
  description: string
  instructions: string
  assistantTypeId: string
  isPublic: boolean
  metadata?: Record<string, any>
}
```

#### Update Template
```typescript
PUT /api/templates/:id
{
  name?: string
  description?: string
  instructions?: string
  isPublic?: boolean
  metadata?: Record<string, any>
}
```

#### List Templates
```typescript
GET /api/templates
Query params:
- assistantTypeId?: string
- isPublic?: boolean
- userId?: string
```

#### Get Template
```typescript
GET /api/templates/:id
```

#### Delete Template
```typescript
DELETE /api/templates/:id
```

### Template Selection Management

#### Get Active Templates
```typescript
GET /api/templates/active
Response:
{
  extraction: {
    id: string
    name: string
    instructions: string
  } | null,
  csv: {
    id: string
    name: string
    instructions: string
  } | null
}
```

#### Set Active Template
```typescript
POST /api/templates/active
{
  assistantTypeId: string
  templateId: string
}
```

#### Clear Active Template
```typescript
DELETE /api/templates/active/:assistantTypeId
```

## Integration with OpenAI Assistants

### 1. Template Application
When processing an SCR document, users can select a custom instruction template:

```typescript
interface ProcessSCRRequest {
  fileId: string
  extractionTemplateId?: string  // Optional custom extraction instructions
  csvTemplateId?: string         // Optional custom CSV generation instructions
}
```

### 2. Instruction Merging
The system combines base instructions with custom templates:

```typescript
async function getAssistantInstructions(assistantType: string, templateId?: string) {
  // Get base instructions
  const baseInstructions = await getBaseInstructions(assistantType);
  
  if (!templateId) return baseInstructions;
  
  // Get custom template
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  });
  
  // Merge instructions (implementation depends on instruction format)
  return mergeInstructions(baseInstructions, template.instructions);
}
```

## Frontend Components

### Template Library
```typescript
interface TemplateLibrary {
  tabs: {
    myTemplates: Template[]
    publicTemplates: Template[]
    organizationTemplates?: Template[]
  }
  filters: {
    assistantType: string[]
    searchTerm: string
    sortBy: 'name' | 'createdAt' | 'usageCount'
  }
}
```

### Template Editor
```typescript
interface TemplateEditor {
  sections: {
    basicInfo: {
      name: string
      description: string
      isPublic: boolean
    }
    instructions: {
      content: string
      preview: ReactNode
    }
    metadata: Record<string, any>
  }
  validation: {
    rules: ValidationRule[]
    preview: boolean
  }
}
```

## Usage Example

```typescript
// Get current template selections for a user
async function getUserTemplateSelections(userId: string) {
  return await prisma.userTemplateSelection.findMany({
    where: { userId },
    include: {
      template: true,
      assistantType: true
    }
  });
}

// Set active template for an assistant type
async function setActiveTemplate(userId: string, assistantTypeId: string, templateId: string) {
  return await prisma.userTemplateSelection.upsert({
    where: {
      userId_assistantTypeId: {
        userId,
        assistantTypeId
      }
    },
    update: {
      templateId
    },
    create: {
      userId,
      assistantTypeId,
      templateId
    }
  });
}

// Processing an SCR with user's active templates
async function processSCR(file: File, userId: string) {
  // 1. Upload file
  const { fileId } = await uploadFile(file);
  
  // 2. Get user's active templates
  const activeTemplates = await prisma.userTemplateSelection.findMany({
    where: { userId },
    include: {
      template: true,
      assistantType: true
    }
  });
  
  // 3. Get extraction template
  const extractionTemplate = activeTemplates.find(
    t => t.assistantType.name === 'SCR Data Extraction'
  );
  
  // 4. Extract data with active template
  const data = await extractData(
    fileId,
    extractionTemplate?.template.instructions
  );
  
  // 5. Get CSV template
  const csvTemplate = activeTemplates.find(
    t => t.assistantType.name === 'CSV Generation'
  );
  
  // 6. Generate CSV with active template
  const csv = await generateCSV(
    data,
    csvTemplate?.template.instructions
  );
  
  return csv;
}
```

## Security Considerations

1. **Access Control**
   - Templates are user-scoped by default
   - Public templates are read-only for non-owners
   - Organization templates require membership verification

2. **Validation**
   - Instructions are validated for required sections
   - Version control prevents concurrent modifications
   - Rate limiting on template creation/modification

3. **Audit Trail**
   - Track template usage and modifications
   - Log instruction changes for compliance
   - Monitor performance impact of custom instructions

## Performance Optimization

1. **Caching**
   - Cache compiled instructions for frequently used templates
   - Store merged instructions temporarily
   - Cache validation results

2. **Batch Processing**
   - Queue template updates
   - Batch instruction merging for multiple files
   - Parallel processing when possible

## Future Enhancements

1. **Template Sharing**
   - Organization-wide templates
   - Template marketplace
   - Rating and review system

2. **Version Control**
   - Template versioning
   - Rollback capability
   - Diff viewer for changes

3. **Analytics**
   - Usage statistics
   - Performance metrics
   - Success rate tracking 