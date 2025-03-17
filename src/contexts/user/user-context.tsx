"use client";

import { createContext } from 'react';
import type { UserContextValue } from '@/types/user';

export const UserContext = createContext<UserContextValue | null>(null); 