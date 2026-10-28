import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/core/Providers";
import Background from "@/components/core/Background";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NeonArcade - Mini Games Hub",
    template: "%s | NeonArcade",
  },
  description: "Your ultimate mini-games hub: Plinko, Sudoku, Tic-Tac-Toe, Snake, Memory Match and Minesweeper.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Background />
          {children}
        </Providers>
      </body>
    </html>
  );
}
