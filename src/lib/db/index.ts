import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Get database URL from environment or fallback
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
};

// Create and export Drizzle instance
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (!dbInstance) {
    const url = getDatabaseUrl();
    const sql = neon(url);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
};

// Export default db instance for convenience
export const db = getDb();

// Re-export schema for convenience
export { schema };
export * from './schema';
