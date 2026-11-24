'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsIcon } from '@/assets/svg/GameIcons';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { useLogoutWithUndo } from '@/hooks/useLogoutWithUndo';

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const LogoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25V5.5h-1.5V4.25a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75V14.5H13v1.25A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M6 10a.75.75 0 01.75-.75h9.546l-2.048-2.048a.75.75 0 111.06-1.06l3.329 3.328a.75.75 0 010 1.06l-3.329 3.328a.75.75 0 11-1.06-1.06l2.048-2.048H6.75A.75.75 0 016 10z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Player profile dropdown: the avatar + name trigger opens a menu with the
 * theme picker, settings, and account actions. Replaces the standalone
 * theme/settings buttons that used to sit in the top bar and game nav.
 */
export const ProfileMenu = () => {
  const { username, balance, isSignedIn } = useGameCurrency();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const logoutWithUndo = useLogoutWithUndo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open player profile menu"
        className="flex items-center gap-2 min-h-10 rounded-xl px-2.5 py-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
      >
        <span className="cursor-pointer relative shrink-0">
          <span className="profile-avatar w-9 h-9 rounded-full flex items-center justify-center text-emerald-300 font-bold text-sm">
            {username.charAt(0).toUpperCase()}
          </span>
          {/* <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080b09] ${
              isSignedIn ? 'bg-green-400' : 'bg-yellow-500'
            }`}
          /> */}
        </span>
        {/* <span className="hidden sm:block text-left leading-tight">
          <span className="block font-display font-semibold text-zinc-200 text-xs max-w-32 truncate">
            {username}
          </span>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {isSignedIn ? 'Player' : 'Guest trial'}
          </span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 text-zinc-600 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg> */}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="profile-menu w-64">
        <DropdownMenuLabel asChild>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-semibold text-base leading-tight truncate">
                {username}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {isSignedIn ? 'Signed in' : 'Guest trial — $50 balance'}
              </p>
            </div>
            <p className="font-mono font-bold text-sm text-emerald-300 tabular-nums shrink-0">
              ${balance.toFixed(2)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={isDarkMode ? 'dark' : 'light'}
          onValueChange={(value) => setIsDarkMode(value === 'dark')}
        >
          <DropdownMenuRadioItem value="dark" className="gap-2 [&>span]:mt-auto [&>span]:mb-auto">
            <SunIcon className="w-4 h-4 text-emerald-300" />
            Dark Cyber
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light" className="gap-2 [&>span]:mt-auto [&>span]:mb-auto">
            <MoonIcon className="w-4 h-4 text-emerald-300" />
            Light Emerald
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={isSignedIn ? "/settings" : "/login?next=%2Fsettings"}
            className="gap-2"
          >
            <SettingsIcon className="w-4 h-4 text-emerald-300" />
            {isSignedIn ? "Settings" : "Settings · sign in"}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isSignedIn ? (
          <DropdownMenuItem
            onSelect={() => logoutWithUndo()}
            className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10"
          >
            <LogoutIcon className="w-4 h-4" />
            Log out
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              8s undo
            </span>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="gap-2 text-blue-400 focus:text-blue-300">
                Log in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/signup"
                className="profile-signup gap-2 font-semibold"
              >
                Sign up — $100 bonus
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
