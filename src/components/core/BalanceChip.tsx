"use client";

import { useGameCurrency } from "@/context/GameCurrencyContext";

const CoinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8 0 2.5 5 1.2 5 3.7 0 1.1-1.1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1.2M12 6.5V8m0 8v1.5" />
  </svg>
);

export default function BalanceChip() {
  const { balance } = useGameCurrency();
  const tone =
    balance < 10
      ? "text-red-400 border-red-500/30 bg-red-500/10"
      : balance < 30
        ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
        : "text-green-400 border-green-500/30 bg-green-500/10";

  return (
    <div
      className={`flex items-center gap-1.5 h-9 px-3 rounded-full border font-mono font-semibold text-sm tabular-nums ${tone}`}
      title="Wallet balance"
      aria-label={`Balance ${balance.toFixed(2)} dollars`}
    >
      <CoinIcon className="w-4 h-4" />
      <span>${balance.toFixed(2)}</span>
    </div>
  );
}
