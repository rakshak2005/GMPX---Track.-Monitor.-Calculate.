import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));

// Resolve the backend port so the dev proxy follows the server automatically:
// explicit PORT env var first, then the root .env file, then the server default.
function backendPort(): number {
  if (process.env.PORT && Number(process.env.PORT) > 0) return Number(process.env.PORT);
  try {
    const rootEnv = fs.readFileSync(path.resolve(here, '..', '.env'), 'utf8');
    const m = rootEnv.match(/^PORT=(\d+)/m);
    if (m && Number(m[1]) > 0) return Number(m[1]);
  } catch {
    /* no root .env — fall through to default */
  }
  return 5001;
}

const port = backendPort();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': `http://localhost:${port}` },
  },
  build: { outDir: 'dist' },
});
