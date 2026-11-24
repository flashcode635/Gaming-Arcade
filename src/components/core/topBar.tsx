'use client';

import Link from 'next/link';
import { SettingsIcon } from '@/assets/svg/GameIcons';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { useTheme } from '@/context/ThemeContext';

export const TopBar = () => {
  const { username, balance, logoutUser } = useGameCurrency();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const isSignedIn = username !== 'Player';

  return (
    <div className="w-full max-w-6xl mb-6 sm:mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-r from-emerald-800 to-emerald-500 flex items-center justify-center text-white font-black text-lg sm:text-xl">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-sans font-normal text-zinc-500 text-xs sm:text-sm">
            Welcome back,
          </p>
          <h2 className="font-display font-semibold text-white text-lg sm:text-xl">
            {username}
          </h2>
          {!isSignedIn && (
            <Link
              href="/signup"
              className="font-sans text-cyan-400 hover:text-cyan-300 underline text-[11px] sm:text-xs"
            >
              Create a player account
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right">
          <p className="font-sans font-medium uppercase tracking-widest text-zinc-500 text-xs sm:text-sm">Balance</p>
          <p className={`font-mono font-bold text-2xl sm:text-3xl tabular-nums drop-shadow ${
            balance < 10 ? 'text-red-400' : balance < 30 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            ${balance.toFixed(2)}
          </p>
        </div>
        {isSignedIn ? (
          <button
            onClick={logoutUser}
            className="px-2.5 sm:px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors font-semibold text-[11px] sm:text-xs"
            title="Log out"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="px-2.5 sm:px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors font-semibold text-[11px] sm:text-xs"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-2.5 sm:px-3 py-2 rounded-lg bg-linear-to-r from-green-500 to-cyan-500 text-black hover:opacity-90 transition-opacity font-bold text-[11px] sm:text-xs"
            >
              Sign Up
            </Link>
          </>
        )}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 sm:p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
        <Link
          href="/settings"
          className="p-2 sm:p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors flex items-center justify-center"
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
      </div>
    </div>
  );
};
