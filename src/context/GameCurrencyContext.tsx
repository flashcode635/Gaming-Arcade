import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction, ReactNode } from 'react';
import { readStoredBalance, STARTING_BALANCE, writeStoredBalance } from '@/lib/currencyStore';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/userStore';

interface GameCurrencyContextType {
  balance: number;
  username: string;
  /** True once the stored player profile (if any) has been loaded from IndexedDB. */
  isAuthLoaded: boolean;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  /** Direct balance write — used by Plinko. */
  setBalance: Dispatch<SetStateAction<number>>;
  setUsername: (name: string) => void;
  /** Persists the signed-up/logged-in player in IndexedDB and shows their name. */
  loginUser: (username: string) => void;
  /** Clears the stored player profile and falls back to "Player". */
  logoutUser: () => void;
}

const GameCurrencyContext = createContext<GameCurrencyContextType | undefined>(undefined);

export function GameCurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(STARTING_BALANCE);
  const balanceRef = useRef(STARTING_BALANCE);
  const hasLocalMutationRef = useRef(false);
  const [username, setUsername] = useState('Player');
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void readStoredBalance()
      .then(storedBalance => {
        if (!active || storedBalance === null || hasLocalMutationRef.current) return;
        balanceRef.current = storedBalance;
        setBalanceState(storedBalance);
      })
      .catch(() => {
        console.error('Could not load the wallet from IndexedDB.');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void readStoredUser()
      .then(storedUser => {
        if (!active) return;
        if (storedUser?.username) setUsername(storedUser.username);
      })
      .catch(() => {
        console.error('Could not load the player profile from IndexedDB.');
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

  const loginUser = (name: string) => {
    setUsername(name);
    void writeStoredUser(name).catch(() => {
      console.error('Could not save the player profile to IndexedDB.');
    });
  };

  const logoutUser = () => {
    setUsername('Player');
    void clearStoredUser().catch(() => {
      console.error('Could not clear the player profile from IndexedDB.');
    });
  };

  return (
    <GameCurrencyContext.Provider
      value={{ balance, username, isAuthLoaded, addBalance, deductBalance, setBalance, setUsername, loginUser, logoutUser }}
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
