import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  // Force light mode only - ignore localStorage and user preferences
  const [theme] = useState<Theme>("light");

  useEffect(() => {
    // Always apply light theme to document element
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
    
    // Always store light theme in localStorage
    localStorage.setItem("theme", "light");
  }, []);

  // Disabled theme toggle - always returns light mode
  const toggleTheme = () => {
    // Do nothing - theme switching disabled
  };

  const setTheme = () => {
    // Do nothing - theme setting disabled
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}