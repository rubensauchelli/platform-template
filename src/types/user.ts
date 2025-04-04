import type { UserResource } from "@clerk/types";

export type ClerkUser = UserResource;

export interface UserContextState {
  user: ClerkUser | null;
  isLoading: boolean;
}

export interface UserContextValue extends UserContextState {
  updateUser: (user: ClerkUser | null) => void;
}

/**
 * User type for API responses
 */
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}; 