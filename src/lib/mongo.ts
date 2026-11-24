import { MongoClient, type Db } from 'mongodb';

/**
 * Shared MongoDB connection for the NeonArcade backend.
 *
 * Primary: a persistent mongod daemon on 127.0.0.1:27017 (dbpath db/mongodb —
 * data survives restarts). Fallback: an embedded mongodb-memory-server
 * instance so signup/login keeps working even when the daemon is down.
 */
const DEFAULT_URI = 'mongodb://127.0.0.1:27017';
const FALLBACK_PORT = 27018;
const DB_NAME = 'neon-arcade';

interface MongoGlobal {
  __neonMongoConnection?: Promise<Db>;
}

const globalRef = globalThis as typeof globalThis & MongoGlobal;

async function ensureIndexes(db: Db): Promise<void> {
  await db.collection('users').createIndex({ username: 1 }, { unique: true, name: 'uniq_username' });
}

async function startEmbeddedMongo(): Promise<string> {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mem = await MongoMemoryServer.create({
    instance: { ip: '127.0.0.1', port: FALLBACK_PORT, dbName: DB_NAME },
  });
  return mem.getUri(DB_NAME);
}

async function connect(): Promise<Db> {
  const primaryUri = process.env.MONGODB_URI ?? DEFAULT_URI;
  try {
    const client = new MongoClient(primaryUri, { serverSelectionTimeoutMS: 1500 });
    await client.connect();
    const db = client.db(DB_NAME);
    await ensureIndexes(db);
    return db;
  } catch {
    const fallbackUri = await startEmbeddedMongo();
    const client = new MongoClient(fallbackUri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const db = client.db(DB_NAME);
    await ensureIndexes(db);
    return db;
  }
}

/** Returns the cached `neon-arcade` database (one connection per process). */
export function getDb(): Promise<Db> {
  if (!globalRef.__neonMongoConnection) {
    globalRef.__neonMongoConnection = connect();
    globalRef.__neonMongoConnection.catch(() => {
      globalRef.__neonMongoConnection = undefined;
    });
  }
  return globalRef.__neonMongoConnection;
}
