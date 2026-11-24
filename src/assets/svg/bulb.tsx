"use client";

import type { CSSProperties } from "react";

export interface LightBulbProps {
  /** Width in px (height auto = 1.4×). Default: 200 */
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export default function LightBulb({
  size = 200,
  className = "",
  style,
  title = "Hint",
}: LightBulbProps) {
  return (
    <div className={`group inline-block ${className}`} style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 280"
        width={size}
        height={size * 1.4}
        role="img"
        aria-labelledby="bulb-title"
        className="
          transition-[filter] duration-500 ease-out
         group-hover:filter-[drop-shadow(0_0_18px_rgba(255,210,31,0.9))]
          motion-reduce:transition-none motion-reduce:group-hover:filter-none
        "
      >
        <title id="bulb-title">{title}</title>

        <defs>
          {/* Soft blur for the halo circles */}
          <filter id="hoverGlowBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="20" />
          </filter>

          {/* Small blur so the filament glows a bit */}
          <filter id="filamentBlur" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip threads inside the base body */}
          <clipPath id="baseClip">
            <path d="M 75,200 L 125,200 L 122,238 Q 121,252 100,252 Q 79,252 78,238 Z" />
          </clipPath>
        </defs>

        {/* ========== 1. HOVER GLOW HALO (hidden by default) ========== */}
        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out motion-reduce:transition-none">
          <circle cx="100" cy="112" r="82" fill="#FFD21F" filter="url(#hoverGlowBlur)" opacity="0.9" />
          <circle cx="100" cy="112" r="58" fill="#FFE45C" filter="url(#hoverGlowBlur)" opacity="0.75" />
        </g>

        {/* ========== 2. LIGHT RAYS (fade in on hover, rotate slow) ========== */}
        <g
          stroke="#FFD21F"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out motion-reduce:transition-none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 100 112"
            to="360 100 112"
            dur="24s"
            repeatCount="indefinite"
          />
          <line x1="178" y1="112" x2="196" y2="112" />
          <line x1="155.2" y1="56.9" x2="167.9" y2="44.1" />
          <line x1="100" y1="34" x2="100" y2="16" />
          <line x1="44.8" y1="56.9" x2="32.1" y2="44.1" />
          <line x1="22" y1="112" x2="4" y2="112" />
          <line x1="44.8" y1="167.1" x2="32.1" y2="179.9" />
          <line x1="100" y1="190" x2="100" y2="208" />
          <line x1="155.2" y1="167.1" x2="167.9" y2="179.9" />
        </g>

        {/* ========== 3. FLAT 2D GLASS BULB ========== */}
        <path
          d="M 100,44 C 136,44 164,72 164,108 C 164,136 148,156 134,172 C 128,179 126,184 126,190 L 74,190 C 74,184 72,179 66,172 C 52,156 36,136 36,108 C 36,72 64,44 100,44 Z"
          fill="#FFD21F"
          stroke="#E6A800"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-[fill] duration-500 group-hover:fill-[#FFE04A]"
        />

        {/* ========== 4. FILAMENT (soft pulse) ========== */}
        <g filter="url(#filamentBlur)" strokeLinecap="round" fill="none">
          <animate attributeName="opacity" values="0.85;1;0.85" dur="1.6s" repeatCount="indefinite" />
          <path d="M 88,152 L 92,182" stroke="#D9A900" strokeWidth="2.5" />
          <path d="M 109,152 L 105,182" stroke="#D9A900" strokeWidth="2.5" />
          <path
            d="M 88,152 C 88,140 95,140 95,152 C 95,140 102,140 102,152 C 102,140 109,140 109,152"
            stroke="#FFFAE0"
            strokeWidth="3"
            strokeLinejoin="round"
          >
            <animate
              attributeName="stroke"
              values="#FFFAE0;#FFFFFF;#FFFAE0"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* ========== 5. FLAT 2D WHITE-SILVER BASE ========== */}
        {/* Collar */}
        <rect
          x="70" y="186" width="60" height="14" rx="4"
          fill="#C5CAD1" stroke="#9AA0A8" strokeWidth="1.5"
        />

        {/* Screw body */}
        <path
          d="M 75,200 L 125,200 L 122,238 Q 121,252 100,252 Q 79,252 78,238 Z"
          fill="#C5CAD1" stroke="#9AA0A8" strokeWidth="1.5" strokeLinejoin="round"
        />

        {/* Threads (clipped to body) */}
        <g clipPath="url(#baseClip)" stroke="#9AA0A8" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M 78,208 Q 100,216 122,208" />
          <path d="M 78,218 Q 100,226 122,218" />
          <path d="M 78,228 Q 100,236 122,228" />
          <path d="M 78,238 Q 100,246 122,238" />
        </g>

        {/* Insulation ring + contact tip */}
        <ellipse cx="100" cy="250.5" rx="11" ry="4" fill="#6E747C" />
        <ellipse cx="100" cy="252.5" rx="6.5" ry="2.8" fill="#8E949C" />
      </svg>
    </div>
  );
}