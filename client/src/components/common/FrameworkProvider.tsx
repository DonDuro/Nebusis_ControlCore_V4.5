import React, { ReactNode } from 'react';
import { FrameworkContext } from '@/hooks/useFramework';
import { useFrameworkMode } from '@/hooks/useFramework';

interface FrameworkProviderProps {
  children: ReactNode;
}

export function FrameworkProvider({ children }: FrameworkProviderProps) {
  const { framework, setFramework } = useFrameworkMode();

  const value = {
    framework,
    setFramework
  };

  return (
    <FrameworkContext.Provider value={value}>
      {children}
    </FrameworkContext.Provider>
  );
}