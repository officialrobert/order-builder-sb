import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from './schema';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 'postgresql://order_builder_user_postgres:order_builder_password_postgres@localhost:5432/order_builder',
});

export const db = drizzle(pool, { schema, casing: 'snake_case' });

export const DatabaseContext = new AsyncLocalStorage<
  PostgresJsDatabase<typeof schema>
>();

export function database() {
  if (!db) {
    throw new Error('DatabaseContext not set');
  }

  return db;
}
