"use client";

import Link from "next/link";
import { useSettings } from "@/context/settingContext";
import { useTheme } from "@/context/ThemeContext";
import { useGameCurrency } from "@/context/GameCurrencyContext";
import { SettingsIcon, GamepadIcon, BoltIcon } from "@/assets/svg/GameIcons";

export default function SettingsPage() {
  const { enhancedGraphics, setEnhancedGraphics } = useSettings();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { balance, username, addBalance } = useGameCurrency();

  return (
    <div className="min-h-screen flex flex-col bg-black/70">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-green-500/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Back to Arcade</span>
          </Link>

          <div className="flex items-center gap-2 text-green-400">
            <SettingsIcon className="w-5 h-5 animate-spin-slow" />
            <span className="font-bold text-sm uppercase tracking-wider">Settings</span>
          </div>
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            <span className="neon-text">System</span>{" "}
            <span className="neon-text-cyan">Settings</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Customize your arcade visual effects, graphics performance, and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Graphics & Visual Effects Section */}
          <section className="bg-dark-card/40 backdrop-blur-md border border-green-500/20 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                <BoltIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Graphics & Performance</h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Control rendering fidelity and animated background effects.
                </p>
              </div>
            </div>

            <div className="border-t border-green-500/10 pt-4">
              {/* Enhanced 3D Background Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base sm:text-lg">
                      Enhanced 3D Background
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                        enhancedGraphics
                          ? "bg-green-500/20 text-green-400 border-green-500/40"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      {enhancedGraphics ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                    Renders an animated 3D WebGL Three.js background scene behind the arcade.
                    Disabled by default for optimal performance and battery efficiency.
                  </p>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enhancedGraphics}
                    onClick={() => setEnhancedGraphics(!enhancedGraphics)}
                    className={`relative inline-flex h-7 py-1 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      enhancedGraphics
                        ? "bg-green-500 border-green-400 shadow-[0_0_12px_rgba(0,255,136,0.6)]"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <span className="sr-only">Toggle Enhanced 3D Background</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        enhancedGraphics ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Theme & Display Section */}
          <section className="bg-dark-card/40 backdrop-blur-md border border-green-500/20 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GamepadIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Appearance & Theme</h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Switch the arcade color palette and theme mode.
                </p>
              </div>
            </div>

            <div className="border-t border-green-500/10 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                  <span className="text-white font-semibold text-base sm:text-lg">
                    Theme Mode
                  </span>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                    Choose between Dark Cyberpunk Neon and Light Emerald styling.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(true)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                      isDarkMode
                        ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                        : "bg-black/30 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    Dark Cyber
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(false)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                      !isDarkMode
                        ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                        : "bg-black/30 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    Light Emerald
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Player & Credits Section */}
          <section className="bg-dark-card/40 backdrop-blur-md border border-green-500/20 rounded-2xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Player Wallet & Credits</h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Manage your virtual arcade balance.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Current Balance</span>
                <p className="text-xl sm:text-2xl font-black font-mono text-green-400">
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-green-500/10 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm text-gray-400">
                Running low on tokens? Refill demo credits anytime.
              </span>
              <button
                type="button"
                onClick={() => addBalance(50)}
                className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-colors"
              >
                + Add $50 Demo Credits
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-500/10 py-6 text-center text-xs text-gray-500">
        NeonArcade System Configuration • Settings automatically persist across sessions
      </footer>
    </div>
  );
}
