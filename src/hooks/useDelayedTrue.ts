'use client';

import { useEffect, useState } from 'react';

/**
 * True only when `active` has stayed true for longer than `delay` ms.
 * Used to hold back skeleton screens on fast loads (e.g. IndexedDB reads that
 * finish in a few ms) so the placeholder never flashes — the UI either shows
 * real content immediately or a skeleton once loading is clearly slow.
 */
export function useDelayedTrue(active: boolean, delay = 300): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Both flips go through a timeout so no state is set synchronously in the
    // effect body: after `delay` when active, immediately (0 ms) when not.
    const timer = setTimeout(() => setShow(active), active ? delay : 0);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return show;
}
