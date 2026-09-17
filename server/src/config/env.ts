import dotenv from 'dotenv';
dotenv.config();

function num(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const env = {
  PORT: num('PORT', 5001),
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_WD7ak9iLdfxM@ep-dawn-term-b37suw1y.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  DATABASE_URL_POOLED:
    process.env.DATABASE_URL_POOLED ||
    'postgresql://neondb_owner:npg_WD7ak9iLdfxM@ep-dawn-term-b37suw1y-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  GMP_PROVIDER: (process.env.GMP_PROVIDER ?? 'live').toLowerCase(),
  GMP_API_URL: process.env.GMP_API_URL ?? '',
  GMP_API_KEY: process.env.GMP_API_KEY ?? '',
  GMP_FALLBACK_URL: process.env.GMP_FALLBACK_URL ?? '',
  GMP_REFRESH_INTERVAL: Math.max(60, num('GMP_REFRESH_INTERVAL', 300)),
  JWT_SECRET: process.env.JWT_SECRET || 'gmpulse_neon_super_secret_jwt_key_2026',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  SEED_DEMO: (process.env.SEED_DEMO ?? 'false').toLowerCase() === 'true',
  isMock: ((process.env.GMP_PROVIDER ?? 'live').toLowerCase() === 'mock'),
};
