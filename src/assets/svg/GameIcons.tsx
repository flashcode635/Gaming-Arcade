export const PlinkoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Side rails — subtle board edges */}
    <line x1="1.5"  y1="3.5" x2="1.5"  y2="17" strokeWidth="0.9" strokeOpacity="0.35" />
    <line x1="22.5" y1="3.5" x2="22.5" y2="17" strokeWidth="0.9" strokeOpacity="0.35" />

    {/* Ball with motion trail (falling) */}
    <circle cx="12" cy="4.5" r="1.4"  fill="currentColor" stroke="none" />
    <circle cx="12" cy="2.6" r="0.55" fill="currentColor" stroke="none" fillOpacity="0.55" />
    <circle cx="12" cy="1.4" r="0.3"  fill="currentColor" stroke="none" fillOpacity="0.3"  />

    {/* Pegs — row 1 (2) */}
    <circle cx="9.5"  cy="8"  r="0.95" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="8"  r="0.95" fill="currentColor" stroke="none" />

    {/* Pegs — row 2 (3) */}
    <circle cx="7"  cy="11" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="12" cy="11" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="17" cy="11" r="0.95" fill="currentColor" stroke="none" />

    {/* Pegs — row 3 (4) */}
    <circle cx="4.5"  cy="14" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="9.5"  cy="14" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="14" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="14" r="0.95" fill="currentColor" stroke="none" />

    {/* Bins — 4 slots; winning slot softly highlighted */}
    <rect x="2"  y="17.5" width="5" height="3.5" rx="0.5" strokeWidth="1.2" />
    <rect x="7"  y="17.5" width="5" height="3.5" rx="0.5" strokeWidth="1.2" />
    <rect x="12" y="17.5" width="5" height="3.5" rx="0.5" strokeWidth="1.2"
          fill="currentColor" fillOpacity="0.18" />
    <rect x="17" y="17.5" width="5" height="3.5" rx="0.5" strokeWidth="1.2" />
  </svg>
);

export const SudokuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer frame - subtle rounded, medium weight */}
    <rect x="3" y="3" width="18" height="18" rx="1.5" strokeWidth="1.4" />

    {/* Thick 3x3 box dividers (the "hero" lines) */}
    <line x1="9"  y1="3"  x2="9"  y2="21" strokeWidth="1.1" />
    <line x1="15" y1="3"  x2="15" y2="21" strokeWidth="1.1" />
    <line x1="3"  y1="9"  x2="21" y2="9"  strokeWidth="1.1" />
    <line x1="3"  y1="15" x2="21" y2="15" strokeWidth="1.1" />

    {/* Thin cell lines - vertical (9x9 detail) */}
    <g strokeWidth="0.6" strokeOpacity="0.55">
      <line x1="5"  y1="3.5" x2="5"  y2="20.5" />
      <line x1="7"  y1="3.5" x2="7"  y2="20.5" />
      <line x1="11" y1="3.5" x2="11" y2="20.5" />
      <line x1="13" y1="3.5" x2="13" y2="20.5" />
      <line x1="17" y1="3.5" x2="17" y2="20.5" />
      <line x1="19" y1="3.5" x2="19" y2="20.5" />
    </g>

    {/* Thin cell lines - horizontal */}
    <g strokeWidth="0.6" strokeOpacity="0.55">
      <line x1="3.5" y1="5"  x2="20.5" y2="5"  />
      <line x1="3.5" y1="7"  x2="20.5" y2="7"  />
      <line x1="3.5" y1="11" x2="20.5" y2="11" />
      <line x1="3.5" y1="13" x2="20.5" y2="13" />
      <line x1="3.5" y1="17" x2="20.5" y2="17" />
      <line x1="3.5" y1="19" x2="20.5" y2="19" />
    </g>

    {/* Filled cells — scattered for a "puzzle-in-progress" feel */}
    <g fill="currentColor" stroke="none" fillOpacity="0.85">
      <circle cx="6"  cy="6"  r="0.65" />
      <circle cx="12" cy="10" r="0.65" />
      <circle cx="18" cy="12" r="0.65" />
      <circle cx="8"  cy="16" r="0.65" />
      <circle cx="16" cy="18" r="0.65" />
    </g>
  </svg>
);

export const TicTacToeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Outer Frame - subtle rounded square */}
    <rect x="2.5" y="2.5" width="19" height="19" rx="2.5" strokeOpacity="0.35" strokeWidth="1.2" />

    {/* Grid Frame - thinner lines */}
    <line x1="8.5" y1="3.5" x2="8.5" y2="20.5" strokeWidth="1.2" />
    <line x1="15.5" y1="3.5" x2="15.5" y2="20.5" strokeWidth="1.2" />
    <line x1="3.5" y1="8.5" x2="20.5" y2="8.5" strokeWidth="1.2" />
    <line x1="3.5" y1="15.5" x2="20.5" y2="15.5" strokeWidth="1.2" />

    {/* Top-Left: X - slightly thinner, more balanced */}
    <line x1="4.7" y1="4.7" x2="7.3" y2="7.3" strokeWidth="1.4" />
    <line x1="7.3" y1="4.7" x2="4.7" y2="7.3" strokeWidth="1.4" />

    {/* Center: O - thinner ring */}
    <circle cx="12" cy="12" r="2" strokeWidth="1.4" />

    {/* Bottom-Right: X - slightly thinner */}
    <line x1="16.7" y1="16.7" x2="19.3" y2="19.3" strokeWidth="1.4" />
    <line x1="19.3" y1="16.7" x2="16.7" y2="19.3" strokeWidth="1.4" />

    {/* Top-Right: small accent O (soft) */}
    <circle cx="18.5" cy="5.5" r="1.3" strokeOpacity="0.55" strokeWidth="1.2" />

    {/* Bottom-Left: small accent dot */}
    <circle cx="5.5" cy="18.5" r="0.7" fill="currentColor" stroke="none" fillOpacity="0.55" />
  </svg>
);

export const SnakeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Snake body — smooth winding path (bottom-left → top-right) */}
    <path
      d="M2.5 19
         Q2.5 15.5 6 15.5
         L11 15.5
         Q14.5 15.5 14.5 12
         L14.5 9.5
         Q14.5 6 17 6"
    />

    {/* Snake head */}
    <circle cx="18.5" cy="6" r="1.6" />

    {/* Eye (small filled dot inside head) */}
    <circle cx="18.5" cy="5.6" r="0.45" fill="currentColor" stroke="none" />

    {/* Forked tongue */}
    <path d="M20.1 5.8 L22 5.4" strokeWidth="0.9" />
    <path d="M20.1 6.2 L22 6.6" strokeWidth="0.9" />

    {/* Food dot — soft accent, top-left */}
    <circle cx="5" cy="6" r="1.2" strokeWidth="1.2" strokeOpacity="0.5" />
  </svg>
);

export const MemoryIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Top-left: face-up card with diamond (one half of matched pair) */}
    <rect x="3" y="3" width="7" height="7" rx="1.3" fill="currentColor" fillOpacity="0.08" />
    <path d="M6.5 4.6 L8.1 6.5 L6.5 8.4 L4.9 6.5 Z" strokeWidth="1.3" />

    {/* Top-right: face-down card with dotted back pattern */}
    <rect x="14" y="3" width="7" height="7" rx="1.3" />
    <g fill="currentColor" stroke="none" fillOpacity="0.4">
      <circle cx="16.2" cy="5.2" r="0.45" />
      <circle cx="18.8" cy="5.2" r="0.45" />
      <circle cx="16.2" cy="7.8" r="0.45" />
      <circle cx="18.8" cy="7.8" r="0.45" />
    </g>

    {/* Bottom-left: face-down card with dotted back pattern */}
    <rect x="3" y="14" width="7" height="7" rx="1.3" />
    <g fill="currentColor" stroke="none" fillOpacity="0.4">
      <circle cx="5.2"  cy="16.2" r="0.45" />
      <circle cx="7.8"  cy="16.2" r="0.45" />
      <circle cx="5.2"  cy="18.8" r="0.45" />
      <circle cx="7.8"  cy="18.8" r="0.45" />
    </g>

    {/* Bottom-right: face-up card with matching diamond (match found!) */}
    <rect x="14" y="14" width="7" height="7" rx="1.3" fill="currentColor" fillOpacity="0.08" />
    <path d="M17.5 15.6 L19.1 17.5 L17.5 19.4 L15.9 17.5 Z" strokeWidth="1.3" />
  </svg>
);

export const MinesweeperIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Spikes (8 directions) */}
    <line x1="12" y1="2.5" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21.5" />
    <line x1="2.5" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="21.5" y2="12" />
    <line x1="5.3" y1="5.3" x2="7.8" y2="7.8" />
    <line x1="16.2" y1="16.2" x2="18.7" y2="18.7" />
    <line x1="5.3" y1="18.7" x2="7.8" y2="16.2" />
    <line x1="16.2" y1="7.8" x2="18.7" y2="5.3" />

    {/* Main mine body */}
    <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.15" />

    {/* Inner highlight ring */}
    <circle cx="12" cy="12" r="3.6" />

    {/* Core */}
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />

    {/* Highlight sparkle on body */}
    <circle cx="9.8" cy="9.8" r="0.9" fill="currentColor" stroke="none" opacity="0.9" />

    {/* Fuse cap at top */}
    <rect x="10.6" y="1.8" width="2.8" height="1.4" rx="0.4" fill="currentColor" stroke="none" />
  </svg>
);

export const GamepadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
    <line x1="6" y1="12" x2="10" y2="12"/>
    <line x1="8" y1="10" x2="8" y2="14"/>
  </svg>
);

export const BoltIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Main bolt body — filled with soft tint */}
    <path
      d="M13.5 2L4 13.5h7L10.5 22 20 10.5h-7L13.5 2z"
      fill="currentColor"
      fillOpacity="0.18"
    />

    {/* Bolt outline */}
    <path d="M13.5 2L4 13.5h7L10.5 22 20 10.5h-7L13.5 2z" />

    {/* Inner highlight streak (left edge) */}
    <path
      d="M12.2 4.5L5.8 12.6"
      strokeWidth="1"
      opacity="0.55"
      strokeLinecap="round"
    />

    {/* Secondary highlight near the tip */}
    <path
      d="M11.8 19.5L18.2 11.4"
      strokeWidth="1"
      opacity="0.55"
      strokeLinecap="round"
    />

    {/* Core sparkle at the bend */}
    <circle cx="11.8" cy="12" r="0.9" fill="currentColor" stroke="none" opacity="0.9" />
  </svg>
);

export const TrophyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 21h8m-4-4v4M5 3h14l-1 9a5 5 0 01-10 0L5 3zM3 3h2a2 2 0 012 2v1a2 2 0 01-2 2H3V3zM21 3h-2a2 2 0 00-2 2v1a2 2 0 002 2h2V3z"/>
  </svg>
);

export const SettingsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
