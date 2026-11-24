/**
 * Client-side player profile storage (IndexedDB).
 *
 * Lives in the same `neon-arcade` database as the wallet store (version 3
 * ensures both stores exist regardless of which module opens first). After
 * sign-up/login the profile is stored here and the player name is shown across
 * the app until logout.
 */
const DB_NAME = 'neon-arcade';
const USER_STORE = 'user';
const CURRENT_USER_KEY = 'currentUser';
const DB_VERSION = 3;

export interface StoredUser {
  key: typeof CURRENT_USER_KEY;
  username: string;
  loggedInAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('wallet')) {
        db.createObjectStore('wallet', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(USER_STORE)) {
        db.createObjectStore(USER_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open user storage.'));
  });
}

export async function readStoredUser(): Promise<StoredUser | null> {
  if (typeof indexedDB === 'undefined') return null;

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(USER_STORE, 'readonly').objectStore(USER_STORE).get(CURRENT_USER_KEY);
    request.onsuccess = () => {
      const record = request.result as StoredUser | undefined;
      resolve(record && typeof record.username === 'string' && record.username.length > 0 ? record : null);
      db.close();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error('Could not read the player profile.'));
    };
  });
}

export async function writeStoredUser(username: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const record: StoredUser = {
      key: CURRENT_USER_KEY,
      username,
      loggedInAt: new Date().toISOString(),
    };
    const request = db.transaction(USER_STORE, 'readwrite').objectStore(USER_STORE).put(record);
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error('Could not save the player profile.'));
    };
  });
}

export async function clearStoredUser(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(USER_STORE, 'readwrite').objectStore(USER_STORE).delete(CURRENT_USER_KEY);
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error('Could not clear the player profile.'));
    };
  });
}
