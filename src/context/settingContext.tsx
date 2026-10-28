"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface SettingsContextType {
  enhancedGraphics: boolean;
  setEnhancedGraphics: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
const STORAGE_KEY = "neon-arcade:enhanced-graphics";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [enhancedGraphics, setState] = useState(false); // default OFF

  // hydration mismatch se bachne ke liye mount ke baad read karo
  useEffect(() => {
    try {
      setState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {}
  }, []);

  const setEnhancedGraphics = (value: boolean) => {
    setState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {}
  };

  return (
    <SettingsContext.Provider value={{ enhancedGraphics, setEnhancedGraphics }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}