"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { withViewTransition } from "@/lib/viewTransition";

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** True for the arcade hub and every game route under it. */
function isArcadeRoute(pathname: string | null): boolean {
  return pathname === "/arcade" || (pathname?.startsWith("/arcade/") ?? false);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();

  // The palette is scoped to the arcade: the landing page, auth screens and
  // settings always render in the default dark theme.
  useEffect(() => {
    document.body.classList.toggle("light-mode", isArcadeRoute(pathname) && !isDarkMode);
  }, [isDarkMode, pathname]);

  // Cross-fade the palette swap via the View Transitions API (skipped for
  // reduced-motion users and unsupported browsers).
  const updateTheme = (value: boolean) => {
    withViewTransition(() => setIsDarkMode(value));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode: updateTheme }}>
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
