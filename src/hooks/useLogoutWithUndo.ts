'use client';

import { toast } from 'sonner';
import { useGameCurrency } from '@/context/GameCurrencyContext';
import { LOGOUT_UNDO_MS } from '@/lib/wallet-constants';

/**
 * Gmail-style logout: no confirm dialog — the guest trial starts right away
 * and an Undo toast (role="status" via sonner) stays up for LOGOUT_UNDO_MS.
 * The MongoDB wallet sync happens only when the toast expires unanswered, so
 * Undo needs no network round-trip.
 */
export function useLogoutWithUndo(): () => void {
  const { username, balance, isSignedIn, beginLogout, undoLogout } = useGameCurrency();

  return () => {
    if (!isSignedIn) return;

    const snapshot = { name: username, amount: balance };
    beginLogout();

    toast.success('Signed out — guest trial active', {
      description: `${snapshot.name}'s wallet ($${snapshot.amount.toFixed(2)}) syncs to MongoDB when this toast closes.`,
      action: {
        label: 'Undo',
        onClick: () => {
          undoLogout();
          toast.success(`Welcome back, ${snapshot.name}`, {
            description: `$${snapshot.amount.toFixed(2)} restored — nothing was saved or lost.`,
          });
        },
      },
      duration: LOGOUT_UNDO_MS,
    });
  };
}
