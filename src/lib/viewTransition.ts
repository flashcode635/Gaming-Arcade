'use client';

type DocumentWithVT = Document & {
  startViewTransition?: (updateCallback: () => void) => unknown;
};

/**
 * Runs `update` inside a View Transition when the browser supports it and the
 * user has not asked for reduced motion; otherwise it runs immediately.
 * Keeps the change under ~300 ms (duration pinned in globals.css).
 */
export function withViewTransition(update: () => void): void {
  if (typeof document === 'undefined') {
    update();
    return;
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as DocumentWithVT;

  if (reduceMotion || typeof doc.startViewTransition !== 'function') {
    update();
    return;
  }

  doc.startViewTransition(update);
}
