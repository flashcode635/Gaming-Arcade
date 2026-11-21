interface BetAmountSliderProps {
    setBetAmount: (amount: number) => void;
    maxBet: number;
    betAmount: number;
    accent?: 'green' | 'cyan';
}

export const BetAmountSlider = ({
    setBetAmount,
    maxBet,
    betAmount,
    accent = 'green',
}: BetAmountSliderProps) => {
    const isCyan = accent === 'cyan';
    const accentText = isCyan ? 'text-cyan-400' : 'text-green-400';
    const accentBorder = isCyan ? 'border-cyan-500/20' : 'border-green-500/20';
    const accentFill = isCyan ? '#22d3ee' : '#00ff88';
    const fillPercent = ((betAmount - 1) / (maxBet - 1)) * 100;

    return (
        <div className="w-full">
                {/* Label + editable value pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-400 text-xs sm:text-sm">Bet Amount</p>
                    {/* <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${accentText} ${accentBorder} ${isCyan ? 'bg-cyan-500/10' : 'bg-green-500/10'} font-semibold tracking-wide`}>
                      USD
                    </span> */}
                  </div>
                  <div className={`flex items-center gap-0.5 ${isCyan ? 'bg-cyan-500/5' : 'bg-green-500/5'} px-2.5 py-1 rounded-lg border ${accentBorder} ${isCyan ? 'focus-within:border-cyan-500/60' : 'focus-within:border-green-500/60'} transition-colors`}>
                    <span className={`${accentText} font-bold text-sm sm:text-base`}>$</span>
                    <input
                      type="number"
                      min={1}
                      max={maxBet}
                      value={betAmount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBetAmount(Math.min(maxBet, Math.max(1, v || 1)));
                      }}
                      aria-label="Bet amount"
                      className={`bg-transparent ${accentText} font-bold text-lg sm:text-xl w-20 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                  </div>
                </div>

                {/* Slider row with − / + steppers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
                    disabled={betAmount <= 1}
                    aria-label="Decrease bet"
                    className={`w-8 h-8 flex items-center justify-center rounded-md bg-dark-surface text-gray-400 ${accentText} ${isCyan ? 'hover:bg-cyan-500/10 hover:border-cyan-500/30' : 'hover:bg-green-500/10 hover:border-green-500/30'} border border-white/5 transition text-sm font-bold select-none disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    −
                  </button>

                  <div className="flex-1 relative h-8 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max={maxBet}
                      step="1"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      aria-label="Bet amount slider"
                      className={`w-full h-2 rounded-full appearance-none cursor-pointer outline-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full
                        ${isCyan ? '[&::-webkit-slider-thumb]:bg-cyan-400' : '[&::-webkit-slider-thumb]:bg-green-400'}
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-dark-surface
                        ${isCyan ? '[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.9)]' : '[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,255,136,0.9)]'}
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-125
                        [&::-webkit-slider-thumb]:active:scale-110
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full
                        ${isCyan ? '[&::-moz-range-thumb]:bg-cyan-400' : '[&::-moz-range-thumb]:bg-green-400'}
                        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-dark-surface
                        ${isCyan ? '[&::-moz-range-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.9)]' : '[&::-moz-range-thumb]:shadow-[0_0_12px_rgba(0,255,136,0.9)]'}`}
                      style={{
                        background: `linear-gradient(to right, ${accentFill} 0%, ${accentFill} ${fillPercent}%, #0d1a0d ${fillPercent}%, #0d1a0d 100%)`
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.min(maxBet, betAmount + 1))}
                    disabled={betAmount >= maxBet}
                    aria-label="Increase bet"
                    className={`w-8 h-8 flex items-center justify-center rounded-md bg-dark-surface text-gray-400 ${isCyan ? 'hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30' : 'hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/30'} border border-white/5 transition text-sm font-bold select-none disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    +
                  </button>
                </div>

                {/* Min / Max labels (aligned with track) */}
                <div className="flex justify-between mt-0.5 px-10">
                  <span className="text-gray-500 text-[10px]">$1</span>
                  <span className="text-gray-500 text-[10px]">${maxBet}</span>
                </div>

                {/* Quick pick buttons */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: "½",   action: () => setBetAmount(Math.max(1, Math.floor(betAmount / 2))) },
                    { label: "2×",  action: () => setBetAmount(Math.min(maxBet, betAmount * 2)) },
                    { label: "Min", action: () => setBetAmount(1) },
                    { label: "Max", action: () => setBetAmount(maxBet) },
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={b.action}
                      className={`py-1.5 rounded-md bg-dark-surface text-gray-300 ${isCyan ? 'hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30' : 'hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/30'} border border-white/5 text-xs font-semibold transition select-none`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
        </div>
    )
}