const DB_NAME = 'neon-arcade';
const STORE_NAME = 'wallet';
const BALANCE_KEY = 'balance';
const STARTING_BALANCE = 100;

interface WalletRecord {
  key: string;
  value: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open wallet storage.'));
  });
}

export async function readStoredBalance(): Promise<number | null> {
  if (typeof indexedDB === 'undefined') return null;

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(BALANCE_KEY);
    request.onsuccess = () => {
      const record = request.result as WalletRecord | undefined;
      resolve(typeof record?.value === 'number' ? record.value : null);
      db.close();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error('Could not read wallet balance.'));
    };
  });
}

export async function writeStoredBalance(balance: number): Promise<void> {
  if (typeof indexedDB === 'undefined') return;

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, 'readwrite')
      .objectStore(STORE_NAME)
      .put({ key: BALANCE_KEY, value: balance } satisfies WalletRecord);
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error ?? new Error('Could not save wallet balance.'));
    };
  });
}

export { STARTING_BALANCE };
