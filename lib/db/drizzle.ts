import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

dotenv.config();

if (!process.env.DB_POSTGRES_URL) {
  throw new Error('DB_POSTGRES_URL environment variable is not set');
}

export const client = postgres(process.env.DB_POSTGRES_URL);
export const db = drizzle(client, { schema });
