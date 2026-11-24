'use client';

import { useIsApplePlatform } from '@/lib/shortcut';

/**
 * Keyboard hint chip shown in menus, tooltips and triggers.
 * Renders ⌘ on Apple platforms and Ctrl elsewhere; SSR renders Ctrl and the
 * client swaps via useSyncExternalStore, so hydration stays stable.
 */
export function Kbd({
  keys,
  className = '',
  mod = true,
}: {
  keys: string;
  className?: string;
  /** Prepend the platform modifier (⌘ / Ctrl). Turn off for plain keys like esc or ↵. */
  mod?: boolean;
}) {
  const isApple = useIsApplePlatform();

  return (
    <kbd
      className={`inline-flex items-center gap-0.5 rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-400 ${className}`}
    >
      {mod && <span>{isApple ? '⌘' : 'Ctrl'}</span>}
      <span>{keys}</span>
    </kbd>
  );
}
