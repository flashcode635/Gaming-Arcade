### Executive Overview & Architecture Invariants

This plan resolves the cascading re-render loops on `/arcade`, eliminates currency generation and reset exploits across all six arcade cabinets, fixes data-loss vulnerabilities during logout and hydration, unifies client-side persistence, and cleans up dead/duplicate code.

#### Key Architectural Invariants
1. **Single Source of Truth**: Currency state resides exclusively in `GameCurrencyContext`. Cabinets never maintain independent balance states.
2. **Stable Context API**: All functions exported by `GameCurrencyProvider` (`addBalance`, `deductBalance`, `setBalance`, `loginUser`, `logoutUser`, etc.) must maintain stable reference identities across renders via `useCallback` with empty dependency arrays and functional state updaters / mutable refs.
3. **Atomic Hydration**: Client hydration resolves in a single consolidated state update, preventing multi-render flashing on startup.
4. **Mandatory Entry Fee Gate**: Every arcade cabinet must require an explicit, atomic balance deduction before gameplay or board interactions unlock.

---

### Phase 1: Critical Stability & Financial Integrity Fixes

#### 1. Plinko Reconciliation Infinite Fetch Loop
- **Target File**: `src/hooks/usePlinkoPhysics.ts`
- **Root Cause**: `usePlinkoGame` runs a `useEffect` on `[username, addBalance]` to reconcile uncredited rounds from `/api/plinko/state`. Because `addBalance` was unstable and regenerated on every balance update in `GameCurrencyProvider`, adding balance triggered a provider re-render, regenerating `addBalance`, which re-ran the effect indefinitely.
- **Implementation Instructions**:
  1. In `src/context/GameCurrencyContext.tsx`, memoize `addBalance`, `deductBalance`, `setBalance`, `setUsername`, `loginUser`, `beginLogout`, and `undoLogout` using `useCallback`.
  2. In `src/hooks/usePlinkoPhysics.ts`, remove `addBalance` from the reconciliation effect's dependency array or ensure the effect runs only when `username` changes.
  3. Ensure that once an uncredited round is credited, its ID is recorded immediately into `localStorage` (`neon-arcade:plinko:credited-rounds`) prior to dispatching state updates.

#### 2. Logout Data Loss & Unreliable Sync
- **Target Files**: `src/context/GameCurrencyContext.tsx`, `src/hooks/useLogoutWithUndo.ts`
- **Root Cause**: `beginLogout()` immediately purged local IndexedDB storage and scheduled an 8-second client-side `setTimeout` before dispatching the balance update to `/api/auth/balance`. If the user closed or reloaded the tab during this window, the timeout was discarded and the balance was permanently lost.
- **Implementation Instructions**:
  1. Update `beginLogout()` to immediately synchronize the player's balance to `/api/auth/balance` using `fetch` with `keepalive: true` or `navigator.sendBeacon`.
  2. Maintain a backup snapshot in `sessionStorage` during the undo countdown window.
  3. If the user clicks `Undo`, restore the user session from the snapshot and reinstate their active state.

#### 3. Free Initial Game & Unpaid Play Exploit
- **Target Files**: `src/components/games/Snake.tsx`, `src/components/games/MemoryGame.tsx`, `src/components/games/TicTacToe.tsx`, `src/components/sudoku/useSudokuGame.ts`, `src/components/sudoku/Sudoku.tsx`
- **Root Cause**:
  - `Snake.tsx`: Pressing `Space` directly toggled `isRunning` to `true` without calling `deductBalance(GAME_COST)`.
  - `MemoryGame.tsx`: Cards were initialized in an unlocked, interactive state on mount without deducting entry fee.
  - `TicTacToe.tsx`: Grid was playable on mount without fee deduction.
  - `useSudokuGame.ts`: Initialized on mount with `{ free: true }` and awarded payouts on completion.
- **Implementation Instructions**:
  1. Add an explicit `hasStarted` / `isGameActive` state to all games.
  2. Require players to press a "Start Game" / "Insert Coin ($1.00)" button or check `deductBalance(ENTRY_FEE)` before enabling game inputs.
  3. Lock board inputs (cards, grid cells, keyboard controls) until the entry fee is successfully debited.

#### 4. Tic-Tac-Toe Local PvP Currency Exploit
- **Target File**: `src/components/games/TicTacToe.tsx`
- **Root Cause**: The win-checking effect awarded `$2.00` regardless of whether the match was played against the AI (`gameMode === 'ai'`) or local two-player (`gameMode === 'pvp'`). On a single shared wallet, players could farm money infinitely in PvP.
- **Implementation Instructions**:
  1. Check `gameMode === 'ai'` before triggering `addBalance(WIN_PAYOUT)`.
  2. In `pvp` mode, disable entry fees and set payouts to `$0.00`.

#### 5. Plinko Balance Reset Exploit
- **Target Files**: `src/hooks/usePlinkoPhysics.ts`, `src/components/games/Plinko.tsx`
- **Root Cause**: The `reset()` function in `usePlinkoPhysics.ts` called `setBalance(startBalance)`, resetting the player's wallet balance back to their mount-time balance.
- **Implementation Instructions**:
  1. Remove `setBalance(startBalance)` from `reset()`.
  2. Ensure `reset()` only clears dropped balls, physics particles, and active board multipliers.

---

### Phase 2: State Architecture & Browser Persistence

#### 1. Unified IndexedDB Storage Engine
- **Target Files**: `src/lib/currencyStore.ts`, `src/lib/userStore.ts` -> Consolidate into `src/lib/storage/idb.ts`
- **Root Cause**: Concurrent `indexedDB.open('neon-arcade', 3)` calls with per-transaction `db.close()` created connection contention, transaction abortions, and hydration race conditions.
- **Implementation Instructions**:
  1. Create a singleton IndexedDB connection manager in `src/lib/storage/idb.ts`.
  2. Cache the `IDBDatabase` promise across all callers.
  3. Provide unified methods: `getStoredState()`, `setStoredBalance(amount)`, and `setStoredUser(profile)`.
  4. Ensure all database operations validate schemas: `balance` must be a non-negative finite number rounded to 2 decimal places.

#### 2. Atomic Hydration on `/arcade`
- **Target Files**: `src/context/GameCurrencyContext.tsx`, `src/components/arcade/ArcadeHub.tsx`
- **Root Cause**: Independent asynchronous state resolutions (`username`, `balance`, `sessionBaseline`, `isAuthLoaded`, `enhancedGraphics`) caused 4–5 staggered re-renders during the first 150ms of page load.
- **Implementation Instructions**:
  1. Consolidate currency context state into a single state object: `{ username, balance, sessionBaseline, isAuthLoaded }`.
  2. Hydrate from IndexedDB in a single batch dispatch.
  3. Ensure `ArcadeHub` renders the correct layout immediately once `isAuthLoaded` is true, avoiding intermediate layout shifts.

#### 3. Floating-Point Precision Normalization
- **Target Files**: `src/context/GameCurrencyContext.tsx`, `src/components/games/Snake.tsx`, `src/components/games/Minesweeper.tsx`
- **Implementation Instructions**:
  1. In `GameCurrencyProvider`, enforce cent rounding inside `addBalance`, `deductBalance`, and `setBalance`:
  ```ts
  const normalizeCurrency = (val: number): number => Math.round(val * 100) / 100;
  ```
  2. Prevent fractional drift from accumulating across score updates.

---

### Phase 3: Route Consolidation & Feature Cleanup

#### 1. Deprecate Top-Level Game Routes
- **Target Files**: `src/app/{snake,plinko,memory,minesweeper,sudoku,tictactoe}/page.tsx`
- **Root Cause**: Direct navigation to top-level routes bypassed `GameNav` and theme styling.
- **Implementation Instructions**:
  1. Replace top-level game page components with Next.js redirect handlers:
  ```ts
  import { redirect } from 'next/navigation';

  export default function Page() {
    redirect('/arcade/<game>');
  }
  ```
  2. Remove obsolete `src/components/Home.tsx`.

#### 2. Settings Page Balance Injection Removal
- **Target File**: `src/app/settings/page.tsx`
- **Root Cause**: A demo button `<button onClick={() => addBalance(50)}> + Add $50 Demo Credits </button>` allowed arbitrary balance increases in production.
- **Implementation Instructions**:
  1. Remove the demo credit injection button from `src/app/settings/page.tsx`.

#### 3. Remove Dead Placeholder Files
- **Target Files**: `src/engine/{memoryEngine,minesweeperEngine,snakeEngine,sudokuEngine,tictactoeEngine}.ts`, `src/hooks/{useMemoryGame,useMinesweeper,useSnakeEngine,useSudoku,useTicTacToe}.ts`, `src/lib/db.ts`
- **Implementation Instructions**:
  1. Remove empty 0-byte placeholder files and unused Prisma references in `src/lib/db.ts`.

---

### Implementation Priority & Action Plan Summary

| Priority | Issue | Root Cause | Target Files | Proposed Fix |
|---|---|---|---|---|
| **Phase 1: P0** | Plinko Re-render Fetch Loop | Unstable `addBalance` context function | `src/context/GameCurrencyContext.tsx`, `src/hooks/usePlinkoPhysics.ts` | Wrap context actions in `useCallback`; decouple plinko reconciliation effect |
| **Phase 1: P0** | Logout Data Loss | Delayed 8s client timer while clearing local IDB | `src/context/GameCurrencyContext.tsx`, `src/hooks/useLogoutWithUndo.ts` | Immediate balance sync with `keepalive: true` |
| **Phase 1: P0** | Free Game Starts | Games playable without paying entry fee | `src/components/games/*` | Add start gate requiring `$1.00` deduction before enabling inputs |
| **Phase 1: P0** | Tic-Tac-Toe PvP Exploit | Win payout granted in 2-player local mode | `src/components/games/TicTacToe.tsx` | Limit payouts to `gameMode === 'ai'` |
| **Phase 1: P0** | Plinko Balance Reset Exploit | `reset()` calls `setBalance(startBalance)` | `src/hooks/usePlinkoPhysics.ts` | Remove balance modification from physics reset |
| **Phase 2: P1** | Hydration Multi-Render Flash | Staggered state updates on mount | `src/context/GameCurrencyContext.tsx`, `src/components/arcade/ArcadeHub.tsx` | Unified atomic hydration batch |
| **Phase 2: P1** | Concurrent IndexedDB Contention | Unpooled duplicate database connections | `src/lib/currencyStore.ts`, `src/lib/userStore.ts` | Unified singleton connection in `src/lib/storage/idb.ts` |
| **Phase 2: P1** | Floating-Point Precision Drift | Fractional arithmetic without cent rounding | `src/context/GameCurrencyContext.tsx` | Enforce `Math.round(val * 100) / 100` normalization |
| **Phase 3: P2** | Settings Credit Injection | Unauthenticated demo balance button | `src/app/settings/page.tsx` | Remove demo button |
| **Phase 3: P2** | Duplicate Top-Level Routes | Inconsistent navigation and styling | `src/app/{snake,plinko,...}/page.tsx` | Redirect top-level routes to `/arcade/[game]` |
| **Phase 3: P3** | Dead Placeholder Files | 10 empty 0-byte files and unused Prisma imports | `src/engine/*`, `src/hooks/*`, `src/lib/db.ts` | Delete obsolete files and unused imports |

---

### Verification & Testing Checklist

- [ ] **Hydration**: Verify `/arcade` mounts cleanly on first load with no visible layout shift or flashing.
- [ ] **Context Memoization**: Verify balance changes do not trigger re-mounts or repeated effect runs across other pages.
- [ ] **Entry Fee Gate**:
  - [ ] Snake: Verify arrow keys or Space do not start the snake without paying `$1.00`.
  - [ ] Memory: Verify cards cannot be flipped until game starts.
  - [ ] Tic-Tac-Toe: Verify cells cannot be clicked until game starts.
  - [ ] Sudoku: Verify first game deducts standard entry fee.
- [ ] **Exploits**:
  - [ ] Verify Tic-Tac-Toe PvP awards `$0.00`.
  - [ ] Verify Plinko reset button does not restore spent balance.
  - [ ] Verify Settings page has no demo balance addition button.
- [ ] **Persistence**:
  - [ ] Verify balance is stored cleanly to two decimal places in IndexedDB.
  - [ ] Verify closing tab during logout does not lose saved balance.
- [ ] **Routing**: Verify `/snake` redirects cleanly to `/arcade/snake` with full navigation bar and theme rendering.
