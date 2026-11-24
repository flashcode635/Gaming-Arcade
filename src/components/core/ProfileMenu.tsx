"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { SettingsIcon } from "@/assets/svg/GameIcons";
import { useGameCurrency } from "@/context/GameCurrencyContext";
import { useTheme } from "@/context/ThemeContext";

const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
  </svg>
);

const MoonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clipRule="evenodd" />
  </svg>
);

export default function ProfileMenu() {
  const { username, balance } = useGameCurrency();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = username.charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-full border
         border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-green-400 outline-hidden"
      >
        <span className="size-7 rounded-full bg-linear-to-br from-emerald-700 to-emerald-400 flex items-center justify-center text-white font-display font-bold text-sm">
          {initial}
        </span>
        <span className="hidden sm:block max-w-28 truncate font-sans font-medium text-sm text-white">
          {username}
        </span>
        {/* <ChevronIcon open={open} /> */}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-green-500/20 bg-dark-card shadow-lg shadow-black/50 overflow-hidden z-50"
        >
          {/* Identity */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-green-500/10">
            <span className="size-11 shrink-0 rounded-full bg-linear-to-br from-emerald-700 to-emerald-400 flex items-center justify-center text-white font-display font-bold text-lg">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-white leading-tight">{username}</p>
              <p className="font-mono text-xs text-zinc-500 tabular-nums">Balance ${balance.toFixed(2)}</p>
            </div>
          </div>

          {/* Settings */}
          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-green-500/10 transition-colors"
            >
              <SettingsIcon className="w-4.5 h-4.5 text-green-400" />
              Settings
            </Link>
          </div>

          {/* Theme */}
          <div className="px-4 py-3 border-t border-green-500/10">
            <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Theme
            </p>
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-green-500/20 bg-green-500/5">
              <button
                type="button"
                role="radio"
                aria-checked={isDarkMode}
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode ? "bg-green-500/20 text-green-400" : "text-zinc-500 hover:text-white"
                }`}
              >
                <MoonIcon /> Dark
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isDarkMode}
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !isDarkMode ? "bg-green-500/20 text-green-400" : "text-zinc-500 hover:text-white"
                }`}
              >
                <SunIcon /> Light
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
