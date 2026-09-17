import { env } from '../config/env.js';
import { refreshAllActive } from '../services/gmpService.js';
import { syncLiveIpos } from '../services/scraperService.js';

let timer: NodeJS.Timeout | null = null;

export function startGmpScheduler(): void {
  if (timer) return;
  const ms = env.GMP_REFRESH_INTERVAL * 1000;
  console.log(`[scheduler] GMP & IPO sync every ${env.GMP_REFRESH_INTERVAL}s (${ms}ms).`);
  
  // Initial sync shortly after boot
  setTimeout(() => {
    syncLiveIpos()
      .then((r) => console.log(`[scheduler] initial live IPO sync: ${r.totalScraped} scraped, ${r.created} new, ${r.updated} updated.`))
      .catch((e) => console.error('[scheduler] initial live IPO sync failed:', (e as Error).message));
  }, 2000);

  timer = setInterval(() => {
    syncLiveIpos()
      .then((r) => {
        if (r.totalScraped > 0 || r.errors.length > 0)
          console.log(`[scheduler] live IPO sync: ${r.totalScraped} scraped, ${r.updated} updated, ${r.errors.length} errors.`);
      })
      .catch((e) => console.error('[scheduler] sync failed:', (e as Error).message));
  }, ms);
  timer.unref?.();
}
