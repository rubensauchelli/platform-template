"use client";

import { useContext } from 'react';
import { UserContext } from '@/contexts/user/user-context';
import type { UserContextValue } from '@/types/user';

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
} 