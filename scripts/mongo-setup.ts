/**
 * Starts a persistent mongod daemon on port 27017 with dbpath db/mongodb,
 * reusing the mongod binary already cached by mongodb-memory-server.
 * Data persists on disk (unlike the in-memory fallback used by the app).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const PROJECT = path.resolve(import.meta.dir, '..');
const DB_PATH = path.join(PROJECT, 'db', 'mongodb');
const PORT = 27017;
const CACHE_DIR = path.join(PROJECT, 'node_modules', '.cache', 'mongodb-memory-server');

function findMongodBinary(): string {
  for (const name of readdirSync(CACHE_DIR)) {
    const full = path.join(CACHE_DIR, name);
    if (name.startsWith('mongod-')) return full;
  }
  throw new Error(`No mongod binary found in ${CACHE_DIR}`);
}

async function main() {
  if (!existsSync(DB_PATH)) mkdirSync(DB_PATH, { recursive: true });

  const probe = spawn('bash', ['-c', `(exec 3<>/dev/tcp/127.0.0.1/${PORT}) 2>/dev/null && echo open || echo closed`]);
  const existing = await new Promise<string>((resolve) => {
    let out = '';
    probe.stdout.on('data', (d) => (out += String(d)));
    probe.on('close', () => resolve(out.trim()));
    probe.on('error', () => resolve('closed'));
  });

  if (existing === 'open') {
    console.log('[mongo-setup] port 27017 already in use — assuming mongod is running.');
    return;
  }

  const mongodBin = findMongodBinary();
  console.log('[mongo-setup] using binary:', mongodBin);

  const logFile = path.join(PROJECT, 'db', 'mongod.log');
  const child = spawn(mongodBin, [
    '--dbpath', DB_PATH,
    '--port', String(PORT),
    '--bind_ip', '127.0.0.1',
    '--logpath', logFile,
    '--fork',
  ], { stdio: 'inherit' });

  const code = await new Promise<number>((resolve) => child.on('close', resolve));
  if (code !== 0) {
    console.error(`[mongo-setup] mongod --fork exited with code ${code}; check ${logFile}`);
    process.exit(code ?? 1);
  }
  console.log('[mongo-setup] mongod daemon running on port', PORT);
}

main().catch((err) => {
  console.error('[mongo-setup] failed:', err);
  process.exit(1);
});
