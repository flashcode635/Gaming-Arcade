import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "@/components/core/Providers";
import "./globals.css";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

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
  // Let the page paint under the notch / Dynamic Island; env(safe-area-inset-*)
  // paddings in globals.css keep real content clear of it.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
