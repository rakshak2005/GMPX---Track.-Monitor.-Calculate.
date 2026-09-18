import pg from 'pg';
import dns from 'node:dns/promises';
import net from 'node:net';
import { env } from './env.js';

const { Pool } = pg;

// Set fallback public DNS servers (Google + Cloudflare) in case ISP DNS blocks *.neon.tech
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

let pool: pg.Pool | null = null;
let isConnected = false;

export async function getDbPool(): Promise<pg.Pool> {
  if (pool) return pool;

  // Use the pooled Neon connection string to ensure smooth reconnection even when compute sleeps
  const connStr = env.DATABASE_URL_POOLED || env.DATABASE_URL;


  // On Render / Linux cloud environments, standard pg connectionString works natively.
  // We only need custom net.stream DNS pre-resolution if running on Windows / local ISP DNS blocks.
  const isWindows = process.platform === 'win32';

  if (!isWindows) {
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    return pool;
  }

  // Windows / local DNS fallback
  const parsed = new URL(connStr);
  const host = parsed.hostname;
  const port = parseInt(parsed.port || '5432', 10);
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = parsed.pathname.replace(/^\//, '');

  let cachedIps: string[] = [];
  try {
    const ips = await dns.resolve4(host);
    if (ips && ips.length > 0) cachedIps = ips;
  } catch {
    cachedIps = ['52.76.246.190', '52.76.212.156', '3.0.27.201'];
  }

  pool = new Pool({
    user,
    password,
    database,
    port,
    host,
    ssl: { rejectUnauthorized: false, servername: host },
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    stream: () => {
      // Connect to resolved IP directly to bypass Windows getaddrinfo DNS timeout
      const ip = cachedIps[Math.floor(Math.random() * cachedIps.length)] || '52.76.246.190';
      return net.connect({ host: ip, port });
    },
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
  `;
  await query(schemaSql);
  console.log('[db] Neon database schema initialized.');
}
