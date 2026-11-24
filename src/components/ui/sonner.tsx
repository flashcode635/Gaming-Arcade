"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"
import { useTheme } from "@/context/ThemeContext"

/**
 * Sonner toaster wired to the neon theme: reads our ThemeContext (not
 * next-themes) and maps the toast palette onto the --color-* tokens defined
 * in globals.css so toasts adapt to dark/light mode automatically.
 * Toasts carry role="status" by default (sonner), so screen readers announce
 * undo toasts politely.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useTheme()

  return (
    <Sonner
      theme={isDarkMode ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-popover)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          actionButton:
            "bg-linear-to-r from-green-500 to-emerald-700 text-black font-bold rounded-lg px-3",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
