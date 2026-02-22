import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool && process.env.DATABASE_URL) {
    // Parse DATABASE_URL to extract components
    const url = new URL(process.env.DATABASE_URL);
    
    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
      // Force IPv4 to avoid ENETUNREACH errors
      options: '-c client_encoding=UTF8',
    });

    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error on idle client', err);
    });

  }

  if (!pool) {
    throw new Error('[DB Pool] DATABASE_URL not configured');
  }

  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
