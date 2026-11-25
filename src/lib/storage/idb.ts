const DB_NAME = 'neon-arcade';
const DB_VERSION = 3;
const WALLET_STORE = 'wallet';
const USER_STORE = 'user';
const BALANCE_KEY = 'balance';
const CURRENT_USER_KEY = 'currentUser';

export interface StoredUser {
  key: typeof CURRENT_USER_KEY;
  username: string;
  loggedInAt: string;
}

export interface StoredState {
  balance: number | null;
  user: StoredUser | null;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(WALLET_STORE)) {
        database.createObjectStore(WALLET_STORE, { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains(USER_STORE)) {
        database.createObjectStore(USER_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open arcade storage.'));
  });

  databasePromise = opening;
  opening.then(database => {
    database.onversionchange = () => {
      database.close();
      if (databasePromise === opening) databasePromise = null;
    };
  }).catch(() => {
    if (databasePromise === opening) databasePromise = null;
  });
  return opening;
}

function normalizeBalance(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError('Balance must be a non-negative finite number.');
  }
  return Math.round(value * 100) / 100;
}

function validateUser(value: unknown): StoredUser | null {
  if (!value || typeof value !== 'object') return null;
  const user = value as Partial<StoredUser>;
  if (typeof user.username !== 'string' || user.username.length === 0) return null;
  return {
    key: CURRENT_USER_KEY,
    username: user.username,
    loggedInAt: typeof user.loggedInAt === 'string' ? user.loggedInAt : '',
  };
}

export async function getStoredState(): Promise<StoredState> {
  if (typeof indexedDB === 'undefined') return { balance: null, user: null };

  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([WALLET_STORE, USER_STORE], 'readonly');
    const balanceRequest = transaction.objectStore(WALLET_STORE).get(BALANCE_KEY);
    const userRequest = transaction.objectStore(USER_STORE).get(CURRENT_USER_KEY);
    let balanceValue: unknown;
    let userValue: unknown;

    balanceRequest.onsuccess = () => {
      balanceValue = (balanceRequest.result as { value?: unknown } | undefined)?.value;
    };
    userRequest.onsuccess = () => {
      userValue = userRequest.result;
    };
    transaction.oncomplete = () => {
      const balance = typeof balanceValue === 'number' && Number.isFinite(balanceValue) && balanceValue >= 0
        ? normalizeBalance(balanceValue)
        : null;
      resolve({ balance, user: validateUser(userValue) });
    };
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not read arcade storage.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Arcade storage read was aborted.'));
  });
}

export async function setStoredBalance(value: number): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const balance = normalizeBalance(value);
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(WALLET_STORE, 'readwrite');
    transaction.objectStore(WALLET_STORE).put({ key: BALANCE_KEY, value: balance });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save wallet balance.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Wallet balance write was aborted.'));
  });
}

export async function setStoredUser(username: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(USER_STORE, 'readwrite');
    const record: StoredUser = {
      key: CURRENT_USER_KEY,
      username,
      loggedInAt: new Date().toISOString(),
    };
    transaction.objectStore(USER_STORE).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the player profile.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Player profile write was aborted.'));
  });
}

export async function clearStoredUser(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(USER_STORE, 'readwrite');
    transaction.objectStore(USER_STORE).delete(CURRENT_USER_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not clear the player profile.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Player profile deletion was aborted.'));
  });
}