"use client";

import type { ReactNode } from "react";
import { GameCurrencyProvider } from "@/context/GameCurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GameNav from "@/components/GameNav";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GameCurrencyProvider>
      <ThemeProvider>
        <div className="min-h-screen grid-bg">
          <GameNav />
          {children}
        </div>
      </ThemeProvider>
    </GameCurrencyProvider>
  );
}
