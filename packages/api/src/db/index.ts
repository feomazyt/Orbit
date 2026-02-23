import { config } from 'dotenv';
import { resolve } from 'path';
import type { EntityManager } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

// Load .env from project root or packages/api
const rootEnv = resolve(process.cwd(), '../../.env');
const localEnv = resolve(process.cwd(), '.env');
config({ path: rootEnv, override: false });
config({ path: localEnv, override: false });

function getDatabaseConfig() {
  const base = {
    extensions: [Migrator],
    entities: ['dist/db/entities/**/*.js'],
    entitiesTs: ['src/db/entities/**/*.ts'],
    migrations: {
      path: 'dist/db/migrations',
      pathTs: 'src/db/migrations',
    },
    pool: { min: 1, max: 10 },
  };

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return defineConfig({ ...base, clientUrl: databaseUrl });
  }

  return defineConfig({
    ...base,
    dbName: process.env.POSTGRES_DB ?? 'orbit',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  });
}

let orm: Awaited<ReturnType<typeof MikroORM.init>> | null = null;

/**
 * Initialize database connection. Call once at app startup.
 * Reads DATABASE_URL from env, or falls back to POSTGRES_HOST, POSTGRES_PORT, POSTGRES_*.
 */
export async function initDatabase() {
  if (orm) return orm;
  orm = await MikroORM.init(getDatabaseConfig());
  return orm;
}

/**
 * Get the ORM instance. Throws if initDatabase() has not been called yet.
 */
export function getOrm() {
  if (!orm)
    throw new Error('Database not initialized. Call initDatabase() first.');
  return orm;
}

/**
 * Get the EntityManager for the current request / app. Use in repos and services.
 */
export function getEntityManager() {
  return getOrm().em.fork();
}

/**
 * Run a callback inside a database transaction. If the callback throws or rejects,
 * the transaction is rolled back. Use this when one business operation spans
 * multiple repository calls.
 *
 * @example
 * await withTransaction(async (em) => {
 *   const repos = getRepositories(em);
 *   const board = await repos.boardRepository.create({ ownerId, title: 'New' });
 *   await repos.listRepository.create({ boardId: board.id, title: 'Backlog' });
 * });
 */
export async function withTransaction<T>(
  fn: (em: EntityManager) => Promise<T>,
): Promise<T> {
  return getOrm().em.transactional(fn);
}

export {
  getRepositories,
  UserRepository,
  BoardRepository,
  ListRepository,
  CardRepository,
  CardCommentRepository,
} from './repositories';
export type { Repositories } from './repositories';
