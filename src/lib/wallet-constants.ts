/**
 * Shared wallet constants — imported by both client code (IndexedDB wallet)
 * and server code (MongoDB user documents), so keep this module free of any
 * browser or Node built-in references.
 */

/** Balance granted to every newly created (signed-up) player. */
export const SIGNUP_BONUS = 100;

/** Balance for signed-out guests playing in trial mode. */
export const TRIAL_BALANCE = 50;

/**
 * How long the "Signed out" toast stays on screen before the wallet is synced
 * to MongoDB. Undo within this window restores the session instantly.
 */
export const LOGOUT_UNDO_MS = 8000;
