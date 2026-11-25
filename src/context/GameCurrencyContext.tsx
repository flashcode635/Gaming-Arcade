import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction, ReactNode } from 'react';
import { clearStoredUser, getStoredState, setStoredBalance, setStoredUser } from '@/lib/storage/idb';
import { SIGNUP_BONUS, TRIAL_BALANCE } from '@/lib/wallet-constants';
import { LOGOUT_UNDO_MS } from '@/lib/wallet-constants';

interface GameCurrencyContextType {
  balance: number;
  /** Wallet snapshot taken once at page load — the "even" line for profit bars and resets. */
  sessionBaseline: number | null;
  username: string;
  /** True once the stored player profile (if any) has been loaded from IndexedDB. */
  isAuthLoaded: boolean;
  /** False while browsing in guest trial mode. */
  isSignedIn: boolean;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  /** Direct balance write — used by Plinko. */
  setBalance: Dispatch<SetStateAction<number>>;
  setUsername: (name: string) => void;
  /**
   * Marks the player as signed in: name is persisted in IndexedDB and shown
   * across the app. When `options.balance` is provided the wallet is replaced
   * with it (signup bonus / balance restored from MongoDB on login).
   */
  loginUser: (username: string, options?: { balance?: number }) => void;
  /**
   * Gmail-style soft logout: switches to the $50 guest trial right away, then
   * waits LOGOUT_UNDO_MS before syncing the old wallet to MongoDB. Pair with
   * an Undo toast — `undoLogout()` inside the window restores everything.
   */
  beginLogout: () => void;
  /** Reverses `beginLogout` if it is still inside the undo window. */
  undoLogout: () => void;
}

const GUEST_NAME = 'Player';
const LOGOUT_SNAPSHOT_KEY = 'neon-arcade:logout-snapshot';

function clearLogoutSnapshot() {
  try {
    sessionStorage.removeItem(LOGOUT_SNAPSHOT_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

interface WalletState {
  username: string;
  balance: number;
  sessionBaseline: number | null;
  isAuthLoaded: boolean;
}

interface LogoutSnapshot {
  username: string;
  balance: number;
  expiresAt: number;
}

const normalizeCurrency = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.round(value * 100) / 100) : 0;

const GameCurrencyContext = createContext<GameCurrencyContextType | undefined>(undefined);

export function GameCurrencyProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    username: GUEST_NAME,
    balance: TRIAL_BALANCE,
    sessionBaseline: null,
    isAuthLoaded: false,
  });
  const balanceRef = useRef(TRIAL_BALANCE);
  const usernameRef = useRef(GUEST_NAME);
  const hasLocalMutationRef = useRef(false);
  /** Pending soft logout — committed (server sync) when the undo window ends. */
  const pendingLogoutRef = useRef<{ timer: ReturnType<typeof setTimeout>; snapshot: LogoutSnapshot } | null>(null);

  const { balance, username, sessionBaseline, isAuthLoaded } = wallet;

  // Boot: load the wallet and the player profile from IndexedDB, then decide
  // the starting funds. Signed-out players with no saved wallet start a $50
  // trial; signed-in players keep their saved balance (signup grants 100).
  useEffect(() => {
    let active = true;
    void getStoredState()
      .then(({ balance: storedBalance, user: storedUser }) => {
        if (!active) return;
        if (hasLocalMutationRef.current) {
          setWallet(current => ({ ...current, isAuthLoaded: true }));
          return;
        }

        const hydratedBalance = normalizeCurrency(
          typeof storedBalance === 'number'
            ? storedBalance
            : storedUser?.username
              ? SIGNUP_BONUS
              : TRIAL_BALANCE,
        );
        const hydratedUsername = storedUser?.username || GUEST_NAME;
        balanceRef.current = hydratedBalance;
        usernameRef.current = hydratedUsername;
        setWallet({
          username: hydratedUsername,
          balance: hydratedBalance,
          sessionBaseline: hydratedBalance,
          isAuthLoaded: true,
        });
      })
      .catch(() => {
        if (active) setWallet(current => ({ ...current, isAuthLoaded: true }));
      });
    return () => {
      active = false;
    };
  }, []);

  const setBalance = useCallback<Dispatch<SetStateAction<number>>>((value) => {
    const nextBalance = normalizeCurrency(typeof value === 'function' ? value(balanceRef.current) : value);
    hasLocalMutationRef.current = true;
    balanceRef.current = nextBalance;
    setWallet(current => ({ ...current, balance: nextBalance }));
    void setStoredBalance(nextBalance).catch(() => {
      console.error('Could not save the wallet to IndexedDB.');
    });
  }, []);

  const addBalance = useCallback((amount: number) => {
    if (!Number.isFinite(amount)) return;
    setBalance(prev => prev + amount);
  }, [setBalance]);

  const deductBalance = useCallback((amount: number): boolean => {
    if (!Number.isFinite(amount) || amount < 0) return false;
    if (balanceRef.current >= normalizeCurrency(amount)) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  }, [setBalance]);

  const cancelPendingLogout = useCallback(() => {
    if (pendingLogoutRef.current) {
      clearTimeout(pendingLogoutRef.current.timer);
      pendingLogoutRef.current = null;
    }
    clearLogoutSnapshot();
  }, []);

  const setUsername = useCallback((name: string) => {
    usernameRef.current = name;
    setWallet(current => ({ ...current, username: name }));
  }, []);

  const loginUser = useCallback((name: string, options?: { balance?: number }) => {
    // Signing back in (or an Undo) cancels any pending logout sync.
    cancelPendingLogout();
    usernameRef.current = name;
    setWallet(current => ({ ...current, username: name }));
    void setStoredUser(name).catch(() => {
      console.error('Could not save the player profile to IndexedDB.');
    });
    if (typeof options?.balance === 'number' && Number.isFinite(options.balance)) {
      const nextBalance = normalizeCurrency(options.balance);
      hasLocalMutationRef.current = true;
      balanceRef.current = nextBalance;
      setWallet(current => ({ ...current, balance: nextBalance }));
      void setStoredBalance(nextBalance).catch(() => {
        console.error('Could not save the wallet to IndexedDB.');
      });
    }
  }, [cancelPendingLogout]);

  /** Switches the UI to the guest trial without touching the server. */
  const enterGuestMode = useCallback(() => {
    usernameRef.current = GUEST_NAME;
    setWallet(current => ({ ...current, username: GUEST_NAME }));
    void clearStoredUser().catch(() => {
      console.error('Could not clear the player profile from IndexedDB.');
    });
    hasLocalMutationRef.current = true;
    balanceRef.current = TRIAL_BALANCE;
    setWallet(current => ({ ...current, balance: TRIAL_BALANCE }));
    void setStoredBalance(TRIAL_BALANCE).catch(() => {
      console.error('Could not reset the wallet to trial mode.');
    });
  }, []);

  const beginLogout = useCallback(() => {
    cancelPendingLogout();
    const snapshot: LogoutSnapshot = {
      username: usernameRef.current,
      balance: balanceRef.current,
      expiresAt: Date.now() + LOGOUT_UNDO_MS,
    };
    try {
      sessionStorage.setItem(LOGOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      // The immediate server sync still protects the wallet if storage is unavailable.
    }
    void fetch('/api/auth/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
      keepalive: true,
    }).catch(() => undefined);
    enterGuestMode();

    const timer = setTimeout(() => {
      pendingLogoutRef.current = null;
      clearLogoutSnapshot();
    }, LOGOUT_UNDO_MS);
    pendingLogoutRef.current = { timer, snapshot };
  }, [cancelPendingLogout, enterGuestMode]);

  const undoLogout = useCallback(() => {
    const pending = pendingLogoutRef.current;
    let snapshot = pending?.snapshot;
    if (!snapshot) {
      try {
        const stored = JSON.parse(sessionStorage.getItem(LOGOUT_SNAPSHOT_KEY) ?? 'null') as Partial<LogoutSnapshot> | null;
        if (
          stored &&
          typeof stored.username === 'string' &&
          typeof stored.balance === 'number' &&
          Number.isFinite(stored.balance) &&
          typeof stored.expiresAt === 'number' &&
          stored.expiresAt > Date.now()
        ) {
          snapshot = {
            username: stored.username,
            balance: normalizeCurrency(stored.balance),
            expiresAt: stored.expiresAt,
          };
        }
      } catch {
        // Ignore missing, malformed, or unavailable session storage.
      }
    }
    if (!snapshot || snapshot.expiresAt <= Date.now()) {
      cancelPendingLogout();
      return;
    }
    cancelPendingLogout();
    loginUser(snapshot.username, { balance: snapshot.balance });
  }, [cancelPendingLogout, loginUser]);

  const isSignedIn = isAuthLoaded && username !== GUEST_NAME;

  return (
    <GameCurrencyContext.Provider
      value={{ balance, sessionBaseline, username, isAuthLoaded, isSignedIn, addBalance, deductBalance, setBalance, setUsername, loginUser, beginLogout, undoLogout }}
    >
      {children}
    </GameCurrencyContext.Provider>
  );
}

export function useGameCurrency() {
  const context = useContext(GameCurrencyContext);
  if (context === undefined) {
    throw new Error('useGameCurrency must be used within a GameCurrencyProvider');
  }
  return context;
}
