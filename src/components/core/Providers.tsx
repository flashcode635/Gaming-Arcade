"use client";

import type { ReactNode } from "react";
import { GameCurrencyProvider } from "@/context/GameCurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/settingContext";
import EnhancedBackground from "@/components/core/enhancedBg";
import GameNav from "@/components/core/GameNav";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <GameCurrencyProvider>
        <ThemeProvider>
          <div className="min-h-screen grid-bg">
            <EnhancedBackground />
            <GameNav />
            {children}
          </div>
        </ThemeProvider>
      </GameCurrencyProvider>
    </SettingsProvider>
  );
}
