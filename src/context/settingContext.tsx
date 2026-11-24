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

  // hydration mismatch se bachne ke liye mount ke baad read karo.
  // localStorage is an external store — the two-pass render is the documented
  // hydration-safe pattern, so the setState-in-effect lint is silenced here.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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