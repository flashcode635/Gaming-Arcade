# NeonArcade

NeonArcade is a browser-based mini-games hub built with Next.js and
TypeScript. It brings six quick games together in a neon-inspired arcade
interface, with a shared credits balance, player name, responsive layouts, and
light/dark theme controls.

## Games

Every game costs **$1 per turn** from the in-game balance.

| Game | Route | Description | Difficulty |
| --- | --- | --- | --- |
| Plinko | [`/arcade/plinko`](http://localhost:3000/arcade/plinko) | Drop the ball — the server decides the fate, the client replays the path. | Hard |
| Sudoku | [`/arcade/sudoku`](http://localhost:3000/arcade/sudoku) | Solve a classic number puzzle. | Medium |
| Tic-Tac-Toe | [`/arcade/tictactoe`](http://localhost:3000/arcade/tictactoe) | Play against the AI or a friend. | Easy |
| Snake | [`/arcade/snake`](http://localhost:3000/arcade/snake) | Apples keep spawning until you lose — or cover the whole board to win. | Medium |
| Memory Match | [`/arcade/memory`](http://localhost:3000/arcade/memory) | Match pairs and test your memory. | Easy |
| Minesweeper | [`/arcade/minesweeper`](http://localhost:3000/arcade/minesweeper) | Find the gems without hitting a mine. | Hard |

## Features

- Product landing page at `/` introducing the arcade
- Signup/login (MongoDB) redirects straight into the arcade hub at `/arcade`
- Guest trial mode — play without an account with a fixed `$50` balance
- Signed-up players start with a `$100` bonus; balances persist in IndexedDB
- Six playable mini-games from one arcade dashboard with per-turn credit deductions
- Player name shown in the top bar and game navigation
- Command menu (`Cmd/Ctrl+K`), shortcut hints, undo toasts, skeleton loaders,
  view transitions, and other UX polish — all respecting `prefers-reduced-motion`
- Responsive design for desktop and mobile screens
- Neon arcade visual system with animated background effects
- Light and dark theme toggle
- Type-safe routes and components with TypeScript

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Three.js for the animated arcade background
- ESLint-free project scripts focused on type-checking and production builds

## Getting started

### Prerequisites

- Node.js 18.18 or newer (or Bun 1.x)
- npm or Bun
- MongoDB (optional — see below)

### Installation

```bash
bun install   # or: npm install
```

### Run the development server

```bash
bun run dev   # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### MongoDB

Signup/login accounts are stored in MongoDB. The app connects to
`mongodb://127.0.0.1:27017`; if no daemon is running it automatically falls back
to an embedded in-memory MongoDB so the app still works. Set the `MONGODB_URI`
environment variable to override the connection string.

A helper script is included to start a persistent local daemon using the cached
mongod binary (requires one prior `bun install`):

```bash
bun run scripts/mongo-setup.ts
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build on port 3000 |
| `npm run lint` | Run ESLint over the project |

## Project structure

```text
src/
├── app/                  # App Router pages, global styles, and API routes
│   ├── api/auth/         # signup / login / check / balance (MongoDB)
│   ├── api/plinko/       # drop / state / reset — server-authoritative backend
│   ├── arcade/           # hub at /arcade + games at /arcade/[game]
│   ├── login/  signup/   # auth screens
│   └── settings/
├── assets/svg/           # Reusable game and interface icons
├── components/           # Landing, arcade hub, auth, games, navigation, providers
├── context/              # Theme and in-game currency state (IndexedDB wallet)
├── engine/               # Shared game math (Plinko odds, paths, geometry)
├── hooks/                # Per-game client controllers and UX helpers
└── lib/                  # MongoDB client, IndexedDB stores, shared utilities
```

## Notes

Accounts live in MongoDB; wallet balances live in the browser (IndexedDB) with
server-side Plinko accounting. There is no real-money payment system — all
credits are virtual and for gameplay inside the browser.

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
