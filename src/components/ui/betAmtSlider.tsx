export const BetAmountSlider = ({setBetAmount, maxBet,betAmount}:any)=>{
    return(
        <>
             <div className="w-full">
                {/* Label + editable value pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-400 text-xs sm:text-sm">Bet Amount</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-semibold tracking-wide">
                      USD
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 bg-green-500/5 px-2.5 py-1 rounded-lg border border-green-500/20 focus-within:border-green-500/60 transition-colors">
                    <span className="text-green-400 font-bold text-sm sm:text-base">$</span>
                    <input
                      type="number"
                      min={1}
                      max={maxBet}
                      value={betAmount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBetAmount(Math.min(maxBet, Math.max(1, v || 1)));
                      }}
                      className="bg-transparent text-green-400 font-bold text-lg sm:text-xl w-20 outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Slider row with − / + steppers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-dark-surface text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 transition text-sm font-bold select-none"
                  >
                    −
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="1"
                      max={maxBet}
                      step="1"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-green-400
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-dark-surface
                        [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,136,0.85)]
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-125
                        [&::-webkit-slider-thumb]:active:scale-110
                        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-green-400
                        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-dark-surface
                        [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,255,136,0.85)]"
                      style={{
                        background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${(betAmount / maxBet) * 100}%, #0d1a0d ${(betAmount / maxBet) * 100}%, #0d1a0d 100%)`
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.min(maxBet, betAmount + 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-dark-surface text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 transition text-sm font-bold select-none"
                  >
                    +
                  </button>
                </div>

                {/* Min / Max labels (aligned with track) */}
                <div className="flex justify-between mt-1.5 px-9">
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
                      className="py-1.5 rounded-md bg-dark-surface text-gray-300 hover:text-green-400 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 text-xs font-semibold transition select-none"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
            </div>
        </>
    )
}