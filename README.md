# NeonArcade

NeonArcade is a browser-based mini-games hub built with Next.js and
TypeScript. It brings six quick games together in a neon-inspired arcade
interface, with a shared credits balance, player name, responsive layouts, and
light/dark theme controls.

## Games

Every game costs **$1 per turn** from the in-game balance.

| Game | Route | Description | Difficulty |
| --- | --- | --- | --- |
| Plinko | [`/plinko`](http://localhost:3000/plinko) | Drop the ball — the server decides the fate, the client replays the path. | Hard |
| Sudoku | [`/sudoku`](http://localhost:3000/sudoku) | Solve a classic number puzzle. | Medium |
| Tic-Tac-Toe | [`/tictactoe`](http://localhost:3000/tictactoe) | Play against the AI or a friend. | Easy |
| Snake | [`/snake`](http://localhost:3000/snake) | Grow the snake and beat your high score. | Medium |
| Memory Match | [`/memory`](http://localhost:3000/memory) | Match pairs and test your memory. | Easy |
| Minesweeper | [`/minesweeper`](http://localhost:3000/minesweeper) | Find the gems without hitting a mine. | Hard |

## Features

- Six playable mini-games from one arcade dashboard
- Shared starting balance of `$100` with per-turn credit deductions
- Player welcome area and balance display
- Responsive design for desktop and mobile screens
- Neon arcade visual system with animated background effects
- Light and dark theme toggle
- Client-side game state managed with React Context
- Type-safe routes and components with TypeScript

## Tech stack

- [Next.js](https://nextjs.org/) 15 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Three.js for the animated arcade background
- ESLint-free project scripts focused on type-checking and production builds

## Getting started

### Prerequisites

- Node.js 18.18 or newer
- npm

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build on port 3000 |

## Project structure

```text
src/
├── app/                  # App Router pages, global styles, and API routes
│   ├── api/plinko/       # drop / state / reset — server-authoritative backend
│   ├── memory/
│   ├── minesweeper/
│   ├── plinko/
│   ├── snake/
│   ├── sudoku/
│   └── tictactoe/
├── assets/svg/           # Reusable game and interface icons
├── components/           # Game screens, navigation, background, and providers
├── context/              # Theme and in-game currency state
├── engine/               # Shared game math (Plinko odds, paths, geometry)
├── hooks/                # Per-game client controllers
└── lib/                  # Server-side stores and shared utilities
```

## Notes

The balance, username, theme, and game sessions currently live in client-side
React state. There is no backend, authentication, database, or real-money
payment system; all credits are for gameplay inside the browser.

---

## Plinko — server-authoritative architecture

Plinko no longer trusts the browser. The outcome is **decided on the server at
click time** ("fate is sealed"), and the client only *plays back* the result:

```
[Client]                                [Server]
Drop click
  | POST /api/plinko/drop -------------> 1. validate + deduct bet (atomic)
  |                                     2. weighted CSPRNG -> slot index (0..8)
  |                                     3. derive L/R direction array (8 moves,
  |                                        # of "R"s == slot index)
  |                                     4. persist round in the ledger
  | <---- { slotIndex, multiplier,      5. credit payout
  |          payout, path[], balance }
  |
  |-- convert path -> waypoints, animate ball (pure tween, no physics)
  |-- on landing: apply payout, flash the slot
```

The direction array is a uniformly random shuffle of `slotIndex` "R"s and
`8 - slotIndex` "L"s, so every valid path to the chosen slot is equally likely
and the ball is mathematically guaranteed to land in the server's slot.

### Key files

| File | Role |
| --- | --- |
| `src/engine/plinkoEngine.ts` | Shared game math: probability table, CSPRNG, path generation, board geometry, waypoints |
| `src/lib/plinkoStore.ts` | Server-only store: per-player balance + round ledger (JSON files under `.data/`, atomic writes, per-username mutex, idempotency) |
| `src/app/api/plinko/drop/route.ts` | `POST` — seals the outcome, returns `path` |
| `src/app/api/plinko/state/route.ts` | `GET` — authoritative balance + recent rounds |
| `src/app/api/plinko/reset/route.ts` | `POST` — tops the account back up to `$100` |
| `src/hooks/usePlinkoPhysics.ts` | Client controller: calls the API, manages balls-in-flight, applies payouts on landing |
| `src/components/games/Plinko.tsx` | Canvas renderer: draws pegs/slots/balls, replays paths, zero per-frame React re-renders |

### Odds & house edge

The slot probabilities live in one table (`SLOT_PROBABILITIES` in
`plinkoEngine.ts`) and are explicit now, instead of emerging from physics:

| Slot | 5x | 1.5x | 1.25x | 0.5x | 0.25x |
| --- | --- | --- | --- | --- | --- |
| Probability (each) | 2% | 6.5% | 12.5% | 20% | 18% (center) |

Expected return per $1 bet: **0.9525** (RTP 95.25%, ~4.75% house edge). Tune
the table to adjust the economy — the UI needs no changes.

### Guarantees & caveats

- The client cannot influence the outcome; it receives it after the fact.
- Retried drops are idempotent: the same `roundId` never charges twice.
- Balances and rounds survive server restarts (`.data/` files).
- Payouts are applied to the UI only when the ball visually lands, so the
  balance number never spoils a round mid-air.
- Still demo-grade: one shared machine store keyed by the display username,
  no auth, no provably-fair seed commitment. The natural next step is the
  Stake-style `HMAC_SHA256(serverSeed, clientSeed:nonce)` commitment scheme
  and a real database.
