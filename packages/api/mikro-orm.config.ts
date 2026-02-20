import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

// Load .env from project root (works when running from packages/api or root)
// process.cwd() will be packages/api when running migrations from there
const rootEnv = resolve(process.cwd(), '../../.env');
const localEnv = resolve(process.cwd(), '.env');
// Try root first, then local
config({ path: rootEnv, override: false });
config({ path: localEnv, override: false });

export default defineConfig({
  extensions: [Migrator],
  dbName: process.env.POSTGRES_DB ?? 'orbit',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  entities: ['dist/db/entities/**/*.js'], // produkcja
  entitiesTs: ['src/db/entities/**/*.ts'], // dev / CLI
  migrations: {
    path: 'dist/db/migrations',
    pathTs: 'src/db/migrations',
  },
});
