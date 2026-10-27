# NeonArcade

NeonArcade is a browser-based mini-games hub built with Next.js and
TypeScript. It brings six quick games together in a neon-inspired arcade
interface, with a shared credits balance, player name, responsive layouts, and
light/dark theme controls.

## Games

Every game costs **$1 per turn** from the in-game balance.

| Game | Route | Description | Difficulty |
| --- | --- | --- | --- |
| Plinko | [`/plinko`](http://localhost:3000/plinko) | Drop the ball and aim for a high-value slot. | Hard |
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
├── app/                  # App Router pages and global styles
│   ├── memory/
│   ├── minesweeper/
│   ├── plinko/
│   ├── snake/
│   ├── sudoku/
│   └── tictactoe/
├── assets/svg/           # Reusable game and interface icons
├── components/           # Game screens, navigation, background, and providers
├── context/              # Theme and in-game currency state
└── lib/                  # Shared game types and utilities
```

## Notes

The balance, username, theme, and game sessions currently live in client-side
React state. There is no backend, authentication, database, or real-money
payment system; all credits are for gameplay inside the browser.
