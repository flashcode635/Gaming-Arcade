// Sudoku.tsx
'use client';

import { useEffect, useRef } from 'react';
import {
  ResetIcon,
  UndoIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '../../assets/svg/Icons';
import { formatTime, MAX_ERRORS, type Difficulty } from './sudokuLogic';
import { useSudokuGame, SudokuGame, SUDOKU_WIN_PAYOUT } from './useSudokuGame';
import { useGameCurrency } from '../../context/GameCurrencyContext';

const timerColor = (t: number) =>
  t <= 60 ? 'text-red-400 animate-pulse' : t <= 120 ? 'text-yellow-400' : 'text-green-400';

// ---------- Sub-components ----------

function SudokuGrid({ game, desktop }: { game: SudokuGame; desktop?: boolean }) {
  const { board, given, selectedCell, errors, conflictCells, notes, getSelectedDigit, handleCellClick } = game;
  const selectedDigit = getSelectedDigit();

  return (
    <div
      className={
        desktop
          ? 'desktop-sudoku-grid'
          : 'mobile-sudoku-grid grid grid-cols-9 border-2 border-green-500/40 rounded-lg overflow-hidden'
      }
    >
      {board.map((row, ri) =>
        row.map((cell, ci) => {
          const key = `${ri}-${ci}`;
          const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
          const isGiven = given[ri]?.[ci];
          // Red = mistake (wrong vs the unique solution) OR a live rule clash
          // (same digit twice in a row/column/box), so the reason is visible.
          const isError = errors.has(key) || conflictCells.has(key);
          const isBorderRight = (ci + 1) % 3 === 0 && ci < 8;
          const isBorderBottom = (ri + 1) % 3 === 0 && ri < 8;
          const isActiveRow = selectedCell?.[0] === ri;
          const isActiveCol = selectedCell?.[1] === ci;
          const isMatching = selectedDigit != null && cell === selectedDigit;

          const cellNotes = notes[key] ?? [];

          const className = [
            'sudoku-cell',
            isSelected && 'selected',
            isGiven ? 'given' : 'user-input',
            isError && 'error',
            (isActiveRow || isActiveCol) && 'active-area',
            isMatching && 'matching-digit',
            isBorderRight && 'sudoku-border-right',
            isBorderBottom && 'sudoku-border-bottom',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={key} onClick={() => handleCellClick(ri, ci)} className={className}>
              {cell ? (
                cell
              ) : cellNotes.length ? (
                <div className="sudoku-notes" aria-label={`Notes: ${cellNotes.join(', ')}`}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i}>{cellNotes.includes(i + 1) ? i + 1 : ''}</span>
                  ))}
                </div>
              ) : (
                ''
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function NumberPad({ game, desktop }: { game: SudokuGame; desktop?: boolean }) {
  const { handleNumberInput, remainingCount, isPlayable } = game;

  return (
    <div className={desktop ? 'grid grid-cols-3 gap-2 md:gap-3' : 'grid grid-cols-9 gap-1 sm:gap-2 mb-3 sm:mb-4'}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
        const remaining = remainingCount(num);
        return (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            disabled={remaining === 0 || !isPlayable}
            className={`relative px-0 bg-dark-surface border border-green-500/20 text-green-400 font-bold rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
              desktop ? 'h-16 text-2xl lg:text-3xl pb-2' : 'mobile-number-button py-3 text-xl sm:text-2xl '
            }`}
          >
            {num}
            {desktop && (
              <span className="absolute bottom-1 inset-x-0 text-[9px] sm:text-[10px] text-gray-500 font-normal">
                {remaining} left
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DifficultyButtons({ game }: { game: SudokuGame }) {
  const { difficulty, startNewGame, canStartNewGame } = game;
  return (
    <div className="flex gap-1 sm:gap-2">
      {(['easy', 'medium', 'hard'] as const).map(d => (
        <button
          key={d}
          onClick={() => startNewGame(d)}
          disabled={!canStartNewGame && difficulty !== d}
          title={canStartNewGame ? undefined : 'Need $1 to start a new game'}
          className={`px-2 sm:px-3 py-1 min-h-11 sm:min-h-0 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            difficulty === d
              ? 'bg-green-500 text-black'
              : `bg-transparent hover:bg-emerald-900/20 text-gray-400
               hover:text-green-200 border
                border-green-500/2 `
          }`}
        >
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}

function Controls({
  game,
  compact,
  mobileActionsOnly,
}: {
  game: SudokuGame;
  compact?: boolean;
  mobileActionsOnly?: boolean;
}) {
  const {
    undo, history, toggleNotesMode, notesMode, eraseSelectedCell,
    togglePause, isPaused, startNewGame, difficulty, won, timeUp, gameOver,
    canStartNewGame,
  } = game;

  const btnClass = compact ? 'control-button' : 'desktop-control-button';
const svgSize= "w-6 h-6";
  return (
    <div className={
      mobileActionsOnly
        ? 'grid grid-cols-3 gap-2 '
        : compact
          ? 'grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4'
          : 'grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.25'
    }>
      <button onClick={undo} disabled={history.length === 0} className={btnClass} 
      title="Undo" aria-label="Undo">
        <UndoIcon className={svgSize} />
      </button>
      <button onClick={toggleNotesMode} className={`${btnClass} ${notesMode ? 'active' : ''}`} title="Notes" aria-label="Toggle notes">
        <PencilIcon className={svgSize} />
      </button>
      <button onClick={eraseSelectedCell} className={btnClass} title="Erase" aria-label="Erase">
        <TrashIcon className={svgSize}  />
      </button>
      {!mobileActionsOnly && (
        <button
          onClick={togglePause}
          disabled={won || timeUp || gameOver}
          className={btnClass}
          title={isPaused ? 'Resume' : 'Pause'}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <PlayIcon className={svgSize} /> : <PauseIcon className={svgSize} />}
        </button>
      )}
      {!mobileActionsOnly && (
        <button
          onClick={() => startNewGame(difficulty)}
          disabled={!canStartNewGame}
          title={canStartNewGame ? 'New Game (-$1)' : 'Need $1 to start a new game'}
          className={`${btnClass} bg-linear-to-r from-green-500 to-emerald-700 text-black disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="New Game"
        >
          <ResetIcon className={svgSize} />
        </button>
      )}
    </div>
  );
}

function BoardOverlay({ game }: { game: SudokuGame }) {
  const { isPaused, togglePause, gameOver, startNewGame, difficulty, canStartNewGame } = game;

  if (isPaused && !gameOver) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm">
        <div className="mx-4 rounded-xl border flex justify-center border-yellow-500/40 bg-dark-card px-6 py-5 text-center shadow-xl">
          <p className="text-xl font-bold text-yellow-400">Game is Paused</p>
          <button
            onClick={togglePause}
            className="mt-3 flex items-center min-h-11 gap-2 rounded-lg bg-yellow-500 px-5 py-2 text-sm font-bold text-black hover:bg-yellow-400"
          >
            <PlayIcon className="w-4 h-4" /> Resume
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/80 backdrop-blur-sm">
        <div className="mx-4 rounded-xl border border-red-500/40 bg-dark-card px-6 py-5 text-center shadow-xl">
          <p className="text-xl font-bold text-red-400">Game Over</p>
          <p className="mt-1 text-sm text-gray-400">You reached {MAX_ERRORS} errors</p>
          <button
            onClick={() => startNewGame(difficulty)}
            disabled={!canStartNewGame}
            className="mt-3 inline-flex items-center min-h-11 rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-black hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canStartNewGame ? 'Try Again (-$1)' : 'Out of Credits'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ---------- Main component ----------

export default function Sudoku() {
  const game = useSudokuGame();
  const { addBalance } = useGameCurrency();
  const {
    board,
    timer,
    errorCount,
    won,
    timeUp,
    gameOver,
    handleKeyDown,
    togglePause,
    isPaused,
    startNewGame,
    difficulty,
    canStartNewGame,
  } = game;

  // "Solve to win" → +$5, credited exactly once per solved game.
  const paidRef = useRef(false);
  useEffect(() => {
    if (won) {
      if (!paidRef.current) {
        paidRef.current = true;
        addBalance(SUDOKU_WIN_PAYOUT);
      }
    } else {
      paidRef.current = false;
    }
  }, [won, addBalance]);

  if (board.length === 0) return null;

  return (
    <>
      {/* Mobile */}
      <div
        className="md:hidden min-h-screen flex flex-col items-center justify-center px-2 py-3"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="bg-dark-card/90 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-lg w-full">
          <div className="flex items-center justify-between mb-3 gap-1.5">
            <div className="text-center">
              <p className="text-gray-500 text-[10px]">Time</p>
              <p className={`text-base font-mono font-bold tabular-nums ${timerColor(timer)}`}>
                {formatTime(timer)}
              </p>
            </div>
            <select
              value={difficulty}
              onChange={event => startNewGame(event.target.value as Difficulty)}
              disabled={!canStartNewGame}
              title={canStartNewGame ? undefined : 'Need $1 to start a new game'}
              className="h-9 rounded-lg border border-green-500/30 bg-dark-surface px-2 text-xs font-semibold text-green-400 outline-none disabled:opacity-40"
              aria-label="Difficulty"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="text-center">
              <p className="text-gray-500 text-[10px]">Errors</p>
              <p className="text-base font-bold text-red-400 tabular-nums">{errorCount} / {MAX_ERRORS}</p>
            </div>
            <button
              onClick={togglePause}
              disabled={won || timeUp || gameOver}
              className="control-button w-11 min-h-11"
              title={isPaused ? 'Resume' : 'Pause'}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => startNewGame(difficulty)}
              disabled={!canStartNewGame}
              className="control-button w-11 min-h-11 bg-linear-to-r from-green-500 to-emerald-700 text-black disabled:opacity-40 disabled:cursor-not-allowed"
              title={canStartNewGame ? 'Restart (-$1)' : 'Need $1 to start a new game'}
              aria-label="Restart"
            >
              <ResetIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <SudokuGrid game={game} />
              <BoardOverlay game={game} />
            </div>
          </div>

          <Controls game={game} compact mobileActionsOnly />
          <NumberPad game={game} />

          {timeUp && (
            <div className="mt-4 text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-xl font-bold">Time&apos;s Up!</p>
              <p className="text-red-300 text-sm">Try again with a new game</p>
            </div>
          )}
          {won && (
            <div className="mt-4 text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-xl font-bold tabular-nums">Congratulations! +${SUDOKU_WIN_PAYOUT.toFixed(2)}</p>
              <p className="text-green-300 text-sm">Solved with {formatTime(timer)} remaining</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div
        className="hidden md:flex h-[calc(100vh-64px)] overflow-hidden items-start justify-center p-6"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-center justify-center gap-6 w-full max-w-5xl">
          <div className="relative shrink-0 flex flex-col gap-4">
            <DifficultyButtons game={game} />
            <SudokuGrid game={game} desktop />
            <BoardOverlay game={game} />
          </div>

          <aside className="w-75 shrink-0 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-green-500/20 bg-dark-card/90 p-3 text-center">
                <p className="text-xs text-gray-500">Time Left</p>
                <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${timerColor(timer)}`}>
                  {formatTime(timer)}
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-dark-card/90 p-3 text-center">
                <p className="text-xs text-gray-500">Mistakes</p>
                <p className="mt-1 text-2xl font-bold text-red-300 tabular-nums">
                  {errorCount} / {MAX_ERRORS}</p>
              </div>
            </div>

            <Controls game={game} />
            <NumberPad game={game} desktop />

            {timeUp && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-bold text-red-400">
                Time&apos;s Up!
              </p>
            )}
            {won && (
              <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-sm font-bold text-green-400 tabular-nums">
                Congratulations! +${SUDOKU_WIN_PAYOUT.toFixed(2)}
              </p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
