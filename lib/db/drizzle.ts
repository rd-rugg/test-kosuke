import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Gracefully degrade when POSTGRES_URL is not set (development without DB)
const hasDatabaseUrl = typeof process !== 'undefined' && !!process.env.POSTGRES_URL;

export const client = hasDatabaseUrl ? postgres(process.env.POSTGRES_URL as string) : (null as unknown as ReturnType<typeof postgres>);
export const db = hasDatabaseUrl ? drizzle(client, { schema }) : (new Proxy({}, {
  get: () => {
    throw new Error('Database is not configured (POSTGRES_URL missing).');
  },
}) as unknown as ReturnType<typeof drizzle>);
