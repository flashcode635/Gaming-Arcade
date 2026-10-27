import { createContext, useContext, useState, ReactNode } from 'react';

interface GameCurrencyContextType {
  balance: number;
  username: string;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  setUsername: (name: string) => void;
}

const GameCurrencyContext = createContext<GameCurrencyContextType | undefined>(undefined);

export function GameCurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(100);
  const [username, setUsername] = useState('Player');

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const deductBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <GameCurrencyContext.Provider value={{ balance, username, addBalance, deductBalance, setUsername }}>
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
