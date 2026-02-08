// src/types/auth.ts
import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}