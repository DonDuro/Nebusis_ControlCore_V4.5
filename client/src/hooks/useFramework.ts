import { useState, useEffect, createContext, useContext } from 'react';

export type FrameworkMode = 'coso' | 'intosai' | 'dual';

interface FrameworkContextType {
  framework: FrameworkMode;
  setFramework: (mode: FrameworkMode) => void;
}

export const FrameworkContext = createContext<FrameworkContextType | null>(null);

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
}

// Hook for framework-specific logic
export function useFrameworkMode() {
  const [framework, setFrameworkState] = useState<FrameworkMode>(() => {
    const stored = localStorage.getItem('controlcore-framework');
    return (stored as FrameworkMode) || 'coso';
  });

  const setFramework = (mode: FrameworkMode) => {
    setFrameworkState(mode);
    localStorage.setItem('controlcore-framework', mode);
  };

  return { framework, setFramework };
}