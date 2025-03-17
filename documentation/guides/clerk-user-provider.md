# Guide to Implementing a User Provider with Clerk

This guide explains how to implement a **User Provider** for managing Clerk user data across your application. We'll follow Next.js and React best practices with a scalable directory structure.

## Directory Structure

First, create the necessary directories:

```
src/
├── types/               # Shared types
│   ├── index.ts        # Central export
│   └── user.ts         # User types
├── contexts/           # Application contexts
│   └── user/
│       ├── user-context.tsx
│       └── user-provider.tsx
└── hooks/             # Shared hooks
    └── use-user.ts    # User context hook
```

## Implementation Steps

### 1. Define User Types

Create type definitions based on Clerk's user data structure.

#### `src/types/user.ts`

```typescript
import { User } from "@clerk/nextjs/dist/types/server";

export type ClerkUser = User;

export interface UserContextState {
  user: ClerkUser | null;
  isLoading: boolean;
}

export interface UserContextValue extends UserContextState {
  updateUser: (user: ClerkUser | null) => void;
}
```

#### `src/types/index.ts`

```typescript
export * from './user';
```

### 2. Create the User Context

Set up the context to share Clerk user data.

#### `src/contexts/user/user-context.tsx`

```typescript
"use client";

import { createContext } from 'react';
import type { UserContextValue } from '@/types';

export const UserContext = createContext<UserContextValue | null>(null);
```

### 3. Implement the User Provider

Create the provider that will use Clerk's hooks.

#### `src/contexts/user/user-provider.tsx`

```typescript
"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import { UserContext } from './user-context';
import type { UserContextValue, ClerkUser } from '@/types';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [state, setState] = useState<UserContextValue>({
    user: null,
    isLoading: !clerkLoaded,
    updateUser: (newUser: ClerkUser | null) => {
      setState(prev => ({
        ...prev,
        user: newUser
      }));
    }
  });

  useEffect(() => {
    if (clerkLoaded) {
      setState(prev => ({
        ...prev,
        user: clerkUser,
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

### 4. Create the User Hook

Implement a custom hook for easier access to user data.

#### `src/hooks/use-user.ts`

```typescript
"use client";

import { useContext } from 'react';
import { UserContext } from '@/contexts/user/user-context';
import type { UserContextValue } from '@/types';

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}
```

### 5. Update Your Layout

Ensure the UserProvider is inside Clerk's provider.

#### `src/app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider } from '@/contexts/user/user-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### 6. Usage Example

Here's how to use the user context in a component:

```typescript
"use client";

import { useUser } from '@/hooks/use-user';

export function UserProfile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {user.imageUrl && (
        <img
          src={user.imageUrl}
          alt={`${user.firstName}'s avatar`}
          className="h-10 w-10 rounded-full"
        />
      )}
      <div>
        <h2 className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-xs text-gray-500">{user.emailAddresses[0].emailAddress}</p>
      </div>
    </div>
  );
}
```

## Benefits of This Structure

1. **Type Safety**: Full TypeScript support with Clerk's types
2. **Clean Architecture**: Separation of types, context, and hooks
3. **Scalability**: Easy to extend with additional user-related features
4. **Maintainability**: Clear organization of user-related code
5. **SSR Compatibility**: Works with Next.js server components

## Next Steps

1. Add middleware for protected routes if not already done
2. Implement loading states and error boundaries
3. Add user preferences if needed
4. Set up proper type checking for Clerk responses

Remember that Clerk handles authentication and user management, so this provider mainly serves as a convenient way to access user data throughout your application.