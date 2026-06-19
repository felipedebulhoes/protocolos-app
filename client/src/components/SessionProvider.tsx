import React from 'react';
import { useSessionExpiration } from '@/hooks/useSessionExpiration';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Hook para monitorar expiração de sessão
  useSessionExpiration();
  
  return <>{children}</>;
}
