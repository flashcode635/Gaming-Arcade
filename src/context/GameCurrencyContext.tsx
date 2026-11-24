import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction, ReactNode } from 'react';
import { readStoredBalance, SIGNUP_BONUS, TRIAL_BALANCE, writeStoredBalance } from '@/lib/currencyStore';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/userStore';
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

const GameCurrencyContext = createContext<GameCurrencyContextType | undefined>(undefined);

export function GameCurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(TRIAL_BALANCE);
  const balanceRef = useRef(TRIAL_BALANCE);
  const hasLocalMutationRef = useRef(false);
  const [username, setUsername] = useState(GUEST_NAME);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [sessionBaseline, setSessionBaseline] = useState<number | null>(null);
  /** Pending soft logout — committed (server sync) when the undo window ends. */
  const pendingLogoutRef = useRef<{ timer: ReturnType<typeof setTimeout>; commit: () => void; snapshot: { username: string; balance: number } } | null>(null);

  // Boot: load the wallet and the player profile from IndexedDB, then decide
  // the starting funds. Signed-out players with no saved wallet start a $50
  // trial; signed-in players keep their saved balance (signup grants 100).
  useEffect(() => {
    let active = true;
    void Promise.all([
      readStoredBalance().catch(() => null),
      readStoredUser().catch(() => null),
    ])
      .then(([storedBalance, storedUser]) => {
        if (!active || hasLocalMutationRef.current) return;

        if (storedUser?.username) setUsername(storedUser.username);

        if (typeof storedBalance === 'number') {
          balanceRef.current = storedBalance;
          setBalanceState(storedBalance);
          setSessionBaseline(storedBalance);
        } else if (storedUser?.username) {
          balanceRef.current = SIGNUP_BONUS;
          setBalanceState(SIGNUP_BONUS);
          setSessionBaseline(SIGNUP_BONUS);
        } else {
          balanceRef.current = TRIAL_BALANCE;
          setBalanceState(TRIAL_BALANCE);
          setSessionBaseline(TRIAL_BALANCE);
        }
      })
      .finally(() => {
        if (active) setIsAuthLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setBalance: Dispatch<SetStateAction<number>> = (value) => {
    const nextBalance = typeof value === 'function' ? value(balanceRef.current) : value;
    hasLocalMutationRef.current = true;
    balanceRef.current = nextBalance;
    setBalanceState(nextBalance);
    void writeStoredBalance(nextBalance).catch(() => {
      console.error('Could not save the wallet to IndexedDB.');
    });
  };

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const deductBalance = (amount: number): boolean => {
    if (balanceRef.current >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const cancelPendingLogout = () => {
    if (!pendingLogoutRef.current) return;
    clearTimeout(pendingLogoutRef.current.timer);
    pendingLogoutRef.current = null;
  };

  const loginUser = (name: string, options?: { balance?: number }) => {
    // Signing back in (or an Undo) cancels any pending logout sync.
    cancelPendingLogout();
    setUsername(name);
    void writeStoredUser(name).catch(() => {
      console.error('Could not save the player profile to IndexedDB.');
    });
    if (typeof options?.balance === 'number') {
      hasLocalMutationRef.current = true;
      balanceRef.current = options.balance;
      setBalanceState(options.balance);
      void writeStoredBalance(options.balance).catch(() => {
        console.error('Could not save the wallet to IndexedDB.');
      });
    }
  };

  /** Switches the UI to the guest trial without touching the server. */
  const enterGuestMode = () => {
    setUsername(GUEST_NAME);
    void clearStoredUser().catch(() => {
      console.error('Could not clear the player profile from IndexedDB.');
    });
    hasLocalMutationRef.current = true;
    balanceRef.current = TRIAL_BALANCE;
    setBalanceState(TRIAL_BALANCE);
    void writeStoredBalance(TRIAL_BALANCE).catch(() => {
      console.error('Could not reset the wallet to trial mode.');
    });
  };

  const beginLogout = () => {
    cancelPendingLogout();
    const snapshot = { username, balance: balanceRef.current };
    enterGuestMode();

    let committed = false;
    const commit = () => {
      // A sign-in or Undo during the window cancels the pending sync.
      if (committed || pendingLogoutRef.current === null) return;
      committed = true;
      pendingLogoutRef.current = null;
      void fetch('/api/auth/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: snapshot.username, balance: snapshot.balance }),
      }).catch(() => undefined);
    };

    const timer = setTimeout(commit, LOGOUT_UNDO_MS);
    pendingLogoutRef.current = { timer, commit, snapshot };
  };

  const undoLogout = () => {
    const pending = pendingLogoutRef.current;
    if (!pending) return;
    cancelPendingLogout();
    loginUser(pending.snapshot.username, { balance: pending.snapshot.balance });
  };

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
