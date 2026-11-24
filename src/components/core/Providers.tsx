"use client";

import type { ReactNode } from "react";
import { GameCurrencyProvider } from "@/context/GameCurrencyContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/settingContext";
import EnhancedBackground from "@/components/core/enhancedBg";
import GameNav from "@/components/core/GameNav";
import CommandMenu from "@/components/core/CommandMenu";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <GameCurrencyProvider>
        <ThemeProvider>
          <div className="min-h-screen grid-bg">
            <EnhancedBackground />
            <GameNav />
            {children}
            <CommandMenu />
            <Toaster position="bottom-right" />
          </div>
        </ThemeProvider>
      </GameCurrencyProvider>
    </SettingsProvider>
  );
}
