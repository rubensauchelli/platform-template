"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import { UserContext } from './user-context';
import type { UserContextValue, ClerkUser } from '@/types/user';

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