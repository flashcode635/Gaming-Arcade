'use client';

import { useSyncExternalStore } from 'react';

/**
 * Keyboard-shortcut helpers shared by the command menu and its hints.
 * Apple platforms show ⌘, everything else shows Ctrl.
 */

function subscribeToPlatform(): () => void {
  // The platform cannot change while the page is open.
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return isApplePlatform();
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Reactive isApplePlatform with SSR-safe hydration (false on the server, the
 * real value on the client) — no effects needed.
 */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(subscribeToPlatform, getClientSnapshot, getServerSnapshot);
}

export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = `${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`;
  return /Mac|iPhone|iPad|iPod/i.test(platform);
}

/** The visual label for the modifier key: ⌘ on Apple, Ctrl elsewhere. */
export function modifierLabel(): '⌘' | 'Ctrl' {
  return isApplePlatform() ? '⌘' : 'Ctrl';
}

/**
 * True when a keyboard event originates inside a field the user types in.
 * Shortcuts never fire while someone is typing.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}
