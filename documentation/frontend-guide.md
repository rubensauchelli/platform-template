# Frontend Documentation

This document provides a detailed overview of the SCR Extraction Tool's frontend architecture, user interface components, and workflow implementation.

## Technology Stack

- **Framework**: Next.js 14 with React (App Router)
- **UI Components**: Shadcn UI (built on Radix UI) with Tailwind CSS
- **State Management**: React Context API and custom hooks
- **Authentication**: Clerk for user management
- **Styling**: Tailwind CSS with custom theming via CSS variables
- **Form Handling**: Custom form implementations with Zod validation
- **File Handling**: react-dropzone for file uploads
- **Notifications**: Sonner toast library for user feedback
- **API Client**: Custom API client with standardized error handling

## Application Structure

The frontend is organized with a clear separation of concerns:

```
src/
├── app/                      # Next.js App Router pages
│   ├── (app)/                # Authenticated app routes
│   ├── api/                  # API endpoints
│   ├── auth/                 # Authentication routes
│   └── globals.css           # Global CSS
├── components/               # React components
│   ├── ui/                   # Base UI components (Shadcn)
│   └── [feature]/            # Feature-specific components
├── contexts/                 # React Context providers
│   ├── user/                 # User context for auth state
│   └── theme/                # Theme context
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and services
│   ├── api-client.ts         # Typed API client
│   ├── utils.ts              # Shared utilities
│   └── openai.ts             # OpenAI integration
└── types/                    # TypeScript type definitions
```

## Component Architecture

The application follows a component-based architecture with clear hierarchy:

1. **Layout Components**: Global layout elements (sidebar, navigation, header)
2. **Page Components**: Main pages corresponding to routes
3. **Feature Components**: Specialized components for specific features
4. **UI Components**: Reusable UI elements based on Shadcn UI
5. **Context Providers**: Global state containers for shared data
6. **Custom Hooks**: Reusable logic for common operations

### UI Component Architecture

The UI components are built using the Shadcn UI library, which provides a collection of accessible, reusable, and customizable components built on top of Radix UI primitives:

```
components/ui/
├── button.tsx       # Button with variants
├── card.tsx         # Card container
├── dialog.tsx       # Modal dialogs
├── dropdown-menu.tsx # Dropdown menus
├── select.tsx       # Select component
├── sidebar.tsx      # Sidebar navigation
└── ...              # Other UI components
```

Each UI component:
- Is built on Radix UI primitives for accessibility
- Uses Tailwind CSS for styling with the `cn` utility for class merging
- Supports variants via class-variance-authority when appropriate
- Includes proper keyboard navigation and screen reader support
- Follows the design system's color scheme and spacing scale

## Core Pages

### SCR Extraction Page

The primary workflow page that enables users to upload and process SCR PDFs.

**Location**: `src/app/(app)/scr-extraction/page.tsx`

**Key Features**:
- PDF file upload and preview with drag-and-drop support
- Template selection for extraction and CSV generation
- Process tracking with step indicators
- Results display with JSON and CSV outputs
- Download options for processed data
- Error handling with user-friendly messages

**Component Structure**:
```
SCR Extraction Page
├── Header with breadcrumb
├── Card container
│   ├── Template Selection component
│   ├── File Drop Box component
│   ├── Processing Pipeline (when active)
│   ├── Error display (if applicable)
│   └── Result display (when complete)
│       ├── JSON data preview
│       ├── CSV preview
│       └── Download buttons
```

### Templates Management Page

Allows users to create, edit, and manage extraction and CSV generation templates.

**Location**: `src/app/(app)/templates/page.tsx`

**Key Features**:
- Tabbed interface for different template types
- Template creation and editing
- Default template selection
- Template deletion with confirmation
- OpenAI model synchronization

**Component Structure**:
```
Templates Page
├── Header with breadcrumb
├── Tab selection (Extraction/CSV)
├── Model Sync component
└── Template grid
    └── Template Card components
```

## Key Components

### File Handling

#### FileDropBox

Handles file uploads, previews, and management.

**Location**: `src/components/file-drop-box.tsx`

**Props**:
- `onFileSelect`: Callback when file is selected
- `selectedFile`: Currently selected file
- `pdfUrl`: Optional URL for existing file
- `disabled`: Whether the component is disabled
- `isProcessing`: Whether a file is currently being processed

**Key Implementation Details**:
- Uses react-dropzone for drag and drop functionality
- Validates file types to accept only PDFs
- Creates object URLs for file previews
- Implements cleanup to prevent memory leaks
- Opens PDF files in a new window for preview
- Provides visual feedback for drag states and validation

**Usage Example**:
```tsx
<FileDropBox
  selectedFile={file}
  onFileSelect={handleFileSelect}
  disabled={!selectedTemplates.extraction || !selectedTemplates.csv}
  isProcessing={isProcessing}
/>
```

### Template Management

#### TemplateSelection

Enables users to select templates for different assistant types.

**Location**: `src/components/template-selection.tsx`

**Props**:
- `onTemplatesChange`: Callback when template selection changes
- `disabled`: Whether the component is disabled
- `open`: Dialog open state
- `onOpenChange`: Callback to change dialog open state
- `initialTemplates`: Initially selected templates

**Key Implementation Details**:
- Uses Dialog component for modal display
- Implements tabbed interface for template types
- Fetches templates from the API
- Provides visual indicators for default templates
- Validates template selections
- Caches selections in state

**Usage Example**:
```tsx
<TemplateSelection
  onTemplatesChange={handleTemplatesChange}
  disabled={isProcessing}
  open={templateDialogOpen}
  onOpenChange={setTemplateDialogOpen}
  initialTemplates={selectedTemplates}
/>
```

#### TemplateForm

Provides a form for creating and editing templates.

**Location**: `src/components/template-form.tsx`

**Props**:
- `template`: Optional existing template to edit
- `onSubmit`: Form submission callback
- `onCancel`: Cancellation callback
- `isSubmitting`: Whether the form is currently submitting
- `defaultType`: Default assistant type

**Key Implementation Details**:
- Implements form validation with client-side feedback
- Provides fields for template metadata (title, description)
- Includes model selection dropdown
- Features temperature control with slider and value display
- Provides system instructions editor for AI configuration
- Includes toggle for setting as default template
- Handles both creation and editing modes with proper initial values

**Usage Example**:
```tsx
<TemplateForm
  template={currentTemplate}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isSubmitting={isSubmitting}
/>
```

### Processing Visualization

#### ProcessingPipeline

Displays the current processing status with steps.

**Location**: `src/components/processing-pipeline.tsx`

**Props**:
- `steps`: Array of processing steps with status

**Key Implementation Details**:
- Visualizes the multi-step extraction process
- Shows progress with status indicators (pending, current, completed, error)
- Provides clear visual feedback on the current step
- Uses animation for smoother transitions between steps
- Accessible with proper ARIA attributes

**Usage Example**:
```tsx
<ProcessingPipeline steps={pipelineSteps} />
```

## State Management

The application uses a combination of state management approaches:

### Global State Management

The application uses React Context for global state:

#### User Context

Manages authentication state and user information.

**Implementation**:
```tsx
// src/contexts/user/user-provider.tsx
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [state, setState] = useState<UserContextValue>({
    user: null,
    isLoading: !clerkLoaded,
    updateUser: (newUser: ClerkUser | null) => {
      setState(prev => ({...prev, user: newUser}));
    }
  });

  useEffect(() => {
    if (clerkLoaded) {
      setState(prev => ({
        ...prev,
        user: clerkUser ?? null,
        isLoading: false
      }));
    }
  }, [clerkUser, clerkLoaded]);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}
```

#### Theme Context

Manages dark/light theme preferences.

**Implementation**:
```tsx
// src/contexts/theme/theme-provider.tsx
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Component State Management

Leverage React hooks for local component state:

- **useState**: For simple component state
- **useReducer**: For more complex state logic
- **useCallback**: For memoized callbacks
- **useMemo**: For derived state and expensive calculations
- **useEffect**: For side effects like API calls and cleanup

### Custom Hooks

The application uses custom hooks to encapsulate reusable logic:

#### useUser

```tsx
// src/hooks/use-user.ts
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}
```

## API Integration

The frontend communicates with the backend through a typed API client:

### API Client

**Location**: `src/lib/api-client.ts`

**Key Features**:
- TypeScript interfaces for request/response types
- Standardized error handling
- HTTP method abstractions
- JWT token handling via Clerk
- Consistent response format

**Implementation Pattern**:
```typescript
class ApiClient extends BaseApiClient {
  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    return this.fetch<Template>('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  
  // Other API methods...
}
```

### Error Handling

The application implements robust error handling at multiple levels:

#### API Error Handling

**Location**: `src/lib/base-api-client.ts`

```typescript
protected async fetch<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {...init, headers});

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new ApiClientError(
        error?.error?.message || `HTTP error ${response.status}`,
        error?.error?.code || ErrorCode.INTERNAL_ERROR,
        response.status
      )
    }

    const data = await response.json()
    if (data.error) {
      throw new ApiClientError(
        data.error.message || 'Unknown error',
        data.error.code || ErrorCode.INTERNAL_ERROR
      )
    }

    return data as T
  } catch (error) {
    // Error handling logic
  }
}
```

#### Component-Level Error Handling

1. **Try-Catch Blocks**: For async operations
2. **Error State**: For displaying error messages
3. **Conditional Rendering**: For showing error UI
4. **Form Validation**: For preventing invalid submissions

**Example from SCR Extraction Page**:
```tsx
try {
  const result = await processFile(file);
  if (!result.success) {
    setError(result.error || 'Failed to process file');
    return;
  }
  setResult(result);
} catch (error) {
  setError(
    error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
  );
}
```

#### User Feedback

1. **Toast Notifications**: For non-blocking feedback
2. **Alert Components**: For important errors
3. **Inline Validation**: For form fields
4. **Loading States**: For indicating processing

## Accessibility

The application prioritizes accessibility with the following features:

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus management for modals and dialogs
- Skip links for screen reader users
- Proper tab order for forms

### Screen Reader Support

- Semantic HTML structure
- ARIA attributes for complex components
- Proper labeling of form fields
- Meaningful alt text for images
- Status announcements for dynamic content

### Visual Accessibility

- High contrast color options
- Responsive text sizing
- Focus indicators
- Color contrast that meets WCAG standards
- Support for system color scheme preferences

### Implementation Examples

**Focus Management in Dialogs**:
```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Select Template</DialogTitle>
    <DialogDescription>
      Choose a template for data extraction
    </DialogDescription>
  </DialogHeader>
  {/* Dialog content */}
  <DialogFooter>
    <Button onClick={onClose}>Cancel</Button>
    <Button onClick={onConfirm}>Confirm</Button>
  </DialogFooter>
</DialogContent>
```

**ARIA Attributes**:
```tsx
<Button 
  aria-label="Preview PDF"
  onClick={openPdfPreview}
  disabled={false}
>
  <ExternalLink className="h-4 w-4" />
</Button>
```

## Workflows

### PDF Processing Workflow

1. **Template Selection**:
   - User selects extraction and CSV generation templates
   - Both template types are required to proceed

2. **File Upload**:
   - User uploads a PDF file (maximum 20MB)
   - File preview is available
   - Validation ensures only PDF files are accepted

3. **Processing**:
   - User initiates processing with "Extract Data" button
   - Processing pipeline displays current status:
     1. Uploading PDF File to OpenAI
     2. Extracting Patient Data from PDF
     3. Cleaning Up Original File
     4. Generating CSV from extracted data

4. **Results**:
   - Extracted data displayed in JSON format
   - Generated CSV available for preview
   - Download options for both formats
   - Option to process a new file

### Template Management Workflow

1. **Template Creation**:
   - User selects template type (Extraction or CSV)
   - Fills template form with:
     - Title and description
     - Model selection from available OpenAI models
     - System instructions for AI behavior
     - Temperature setting (0.0-2.0)
     - Default template option

2. **Template Editing**:
   - Select existing template
   - Modify settings
   - Save changes with validation

3. **Default Template Selection**:
   - Mark template as default for its type
   - Only one default per type is allowed
   - Previously set default is automatically unset

4. **Template Deletion**:
   - Confirm deletion via dialog
   - Cannot delete a template currently in use
   - Associated OpenAI assistant is also deleted

## Responsive Design

The UI is fully responsive with tailored layouts for different devices:

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column layouts
- Hover interactions
- Advanced previews

### Tablet (768px - 1023px)
- Collapsible sidebar
- Optimized form layouts
- Adjusted spacing
- Simplified previews

### Mobile (< 768px)
- Hidden sidebar with toggle
- Single column layouts
- Stack components vertically
- Touch-optimized controls
- Simplified views for smaller screens

**Implementation with Tailwind**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {templates.map(template => (
    <TemplateCard key={template.id} template={template} />
  ))}
</div>
```

## Performance Optimizations

The application implements several performance optimizations:

- **Code Splitting**: Route-based code splitting with Next.js
- **Lazy Loading**: Components and resources loaded on demand
- **Memoization**: Using React.memo, useMemo, and useCallback
- **Image Optimization**: Next.js Image component for optimized loading
- **CSS Optimization**: Tailwind's JIT compiler for minimal CSS
- **API Response Caching**: Caching for API responses where appropriate
- **Font Optimization**: Loading only required font weights

## Future Enhancements

1. **Offline Support**: Progressive Web App capabilities for offline use
2. **Batch Processing**: Handling multiple files in a single operation
3. **Advanced Visualizations**: Charts and graphs for data representation
4. **Template Sharing**: Collaboration features for team environments
5. **Mobile Optimizations**: Dedicated mobile experience with touch gestures
6. **Keyboard Shortcuts**: Enhanced keyboard navigation and shortcuts
7. **Analytics Dashboard**: Usage statistics and insights
8. **Multi-language Support**: Internationalization for global users 