import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { startGmpScheduler } from './jobs/gmpScheduler.js';
import { optionalAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { ipoRouter } from './routes/ipos.js';
import { metaRouter } from './routes/meta.js';

const appCwd = process.cwd();

async function main(): Promise<void> {
  await connectDb();

  const app = express();
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (
          env.CLIENT_URL === '*' ||
          origin === env.CLIENT_URL ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive CORS for public API dashboard
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(optionalAuth);

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, provider: env.GMP_PROVIDER, refreshIntervalSec: env.GMP_REFRESH_INTERVAL, demoMode: env.isMock, time: new Date().toISOString() }),
  );
  app.use('/api/auth', authRouter);
  app.use('/api/ipos', ipoRouter);
  app.use('/api', metaRouter);

  // Serve built client when present (production).
  const candidates = [
    path.resolve(appCwd, 'client-dist'),
    path.resolve(appCwd, '../client/dist'),
    path.resolve(appCwd, 'dist/public'),
  ];
  const serveDir = candidates.find((d) => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html'))) ?? null;
  if (serveDir) {
    app.use(express.static(serveDir));
    app.get('*', (_req, res) => res.sendFile(path.join(serveDir, 'index.html')));
  }

  // Friendly error handler (never leak stack to clients).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[api] error:', err instanceof Error ? err.message : err);
    const status = (err as { status?: number }).status ?? 500;
    if (err instanceof Error && ['CastError'].includes(err.name)) return res.status(400).json({ error: 'Invalid ID format.' });
    res.status(status).json({ error: err instanceof Error ? err.message : 'Internal server error.' });
  });

  app.listen(env.PORT, () => console.log(`[server] GMPulse API on :${env.PORT} (provider=${env.GMP_PROVIDER})`));
  startGmpScheduler();
}

main().catch((e) => {
  console.error('[server] fatal:', e);
  process.exit(1);
});
