import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction, ReactNode } from 'react';
import { readStoredBalance, STARTING_BALANCE, writeStoredBalance } from '@/lib/currencyStore';

interface GameCurrencyContextType {
  balance: number;
  username: string;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  /** Direct balance write — used by Plinko to mirror the server-authoritative wallet. */
  setBalance: Dispatch<SetStateAction<number>>;
  setUsername: (name: string) => void;
}

const GameCurrencyContext = createContext<GameCurrencyContextType | undefined>(undefined);

export function GameCurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(STARTING_BALANCE);
  const balanceRef = useRef(STARTING_BALANCE);
  const hasLocalMutationRef = useRef(false);
  const [username, setUsername] = useState('Player');

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

  return (
    <GameCurrencyContext.Provider
      value={{ balance, username, addBalance, deductBalance, setBalance, setUsername }}
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
