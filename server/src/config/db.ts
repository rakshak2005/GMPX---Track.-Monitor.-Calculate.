import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;

export async function getDbPool(): Promise<pg.Pool> {
  if (pool) return pool;

  // Use the pooled Neon connection string to ensure smooth reconnection even when compute sleeps
  const connStr = env.DATABASE_URL_POOLED || env.DATABASE_URL;

  pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });


  pool.on('error', (err) => {
    // Neon serverless suspends compute when idle, causing ECONNRESET on idle connections.
    // Catching this prevents unhandled socket exceptions and allows pg-pool to recreate fresh connections.
    if ((err as any).code === 'ECONNRESET') {
      console.warn('[db] Idle Neon connection reset by serverless host; will reconnect on next query.');
    } else {
      console.error('[db] Unexpected pool error:', err.message);
    }
  });

  return pool;
}


export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  const p = await getDbPool();
  return p.query<T>(text, params);
}

export async function connectDb(): Promise<void> {
  try {
    const res = await query<{ now: Date }>('SELECT NOW()');
    isConnected = true;
    console.log('[db] Neon PostgreSQL connected successfully at', res.rows[0]?.now);
    await initSchema();
  } catch (err) {
    console.error('[db] Neon PostgreSQL connection failed:', (err as Error).message);
    isConnected = false;
  }
}

export function isNeonConnected(): boolean {
  return isConnected;
}

async function initSchema(): Promise<void> {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) DEFAULT '',
      preferences JSONB DEFAULT '{"marketFilter": "Open", "categoryFilter": "All"}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ipos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      company_name VARCHAR(255) DEFAULT '',
      symbol VARCHAR(50) DEFAULT '',
      logo_url TEXT DEFAULT '',
      issue_price NUMERIC DEFAULT 0,
      lot_size INTEGER DEFAULT 15,
      open_date TIMESTAMPTZ,
      close_date TIMESTAMPTZ,
      allotment_date TIMESTAMPTZ,
      listing_date TIMESTAMPTZ,
      market_status VARCHAR(50) DEFAULT 'Upcoming',
      category VARCHAR(50) DEFAULT 'Mainboard',
      current_gmp NUMERIC DEFAULT 0,
      prev_gmp NUMERIC DEFAULT NULL,
      gmp_trend VARCHAR(10) DEFAULT NULL,
      last_gmp_at TIMESTAMPTZ,
      gmp_source VARCHAR(100) DEFAULT 'IPOWatch Live',
      gmp_stale BOOLEAN DEFAULT FALSE,
      subscription JSONB DEFAULT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );


    CREATE TABLE IF NOT EXISTS user_ipos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
      lots_applied INTEGER DEFAULT 1,
      issue_price NUMERIC DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Applied',
      allotted_lots INTEGER DEFAULT NULL,
      actual_listing_price NUMERIC DEFAULT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, ipo_id)
    );

    CREATE TABLE IF NOT EXISTS gmp_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ipo_id UUID NOT NULL REFERENCES ipos(id) ON DELETE CASCADE,
      gmp NUMERIC NOT NULL,
      source VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Performance indexes for fast filtering and joins
    CREATE INDEX IF NOT EXISTS idx_ipos_created_at ON ipos(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ipos_close_date ON ipos(close_date);
    CREATE INDEX IF NOT EXISTS idx_ipos_listing_date ON ipos(listing_date);
    CREATE INDEX IF NOT EXISTS idx_user_ipos_user_id ON user_ipos(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_ipos_ipo_id ON user_ipos(ipo_id);
    CREATE INDEX IF NOT EXISTS idx_gmp_history_ipo_id ON gmp_history(ipo_id, created_at DESC);
  `;
  await query(schemaSql);
  console.log('[db] Neon database schema initialized.');
}
