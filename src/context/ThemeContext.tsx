"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const STORAGE_KEY = "neon-arcade:theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkModeState] = useState(true);

  // mount ke baad stored theme read karo (hydration mismatch avoid)
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "light") setIsDarkModeState(false);
    } catch {}
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light-mode", !isDarkMode);
  }, [isDarkMode]);

  const setIsDarkMode = (value: boolean) => {
    setIsDarkModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "dark" : "light");
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
