// src/context/AuthContext.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/types/auth';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const auth = useAuth();

  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    props.children
  );
};