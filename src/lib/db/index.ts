import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var db: ReturnType<typeof drizzle> | undefined;
}

export const getDb = (): ReturnType<typeof drizzle> => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  if (global.db) {
    return global.db;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  if (process.env.NODE_ENV === 'production') {
    return db;
  }

  // Cache in development to prevent multiple connections
  global.db = db;
  return db;
};

// Re-export schema for convenience
export { schema };
export * from './schema';
