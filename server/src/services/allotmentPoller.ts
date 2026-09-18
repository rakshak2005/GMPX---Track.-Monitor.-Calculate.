import { listIpos, updateIpoStatus } from './ipoStore.js';
import { checkIpoAllotment } from './registrarService.js';
import { query } from '../config/db.js';
import { env } from '../config/env.js';


let pollerInterval: NodeJS.Timeout | null = null;

/**
 * Check whether current Indian Standard Time (IST = UTC+5:30) is at or past 7:00 PM (19:00)
 */
export function isPast7PmIst(): boolean {
  const now = new Date();
  // IST is UTC + 5.5 hours
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  const hours = istDate.getUTCHours();
  return hours >= 19; // 19:00 (7 PM) onwards
}

/**
 * Check if a date string is today in IST
 */
export function isTodayOrPastIst(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(Date.now() + istOffsetMs);
  const targetIst = new Date(d.getTime() + istOffsetMs);

  const nowDay = nowIst.toISOString().slice(0, 10);
  const targetDay = targetIst.toISOString().slice(0, 10);

  return targetDay <= nowDay;
}

/**
 * Execute a single polling cycle across active applications
 */
export async function runAllotmentPollCycle(): Promise<void> {
  try {
    // Only poll from 7:00 PM IST onwards
    if (!isPast7PmIst()) {
      return;
    }

    // Get all users who have a saved PAN in preferences
    const usersRes = await query<{ id: string; email: string; preferences: { pan?: string; alertEmail?: string } }>(
      `SELECT id, email, preferences FROM users WHERE preferences->>'pan' IS NOT NULL`,
    );

    const userPanMap = new Map<string, { pan: string; email: string }>();
    for (const u of usersRes.rows) {
      if (u.preferences?.pan) {
        userPanMap.set(u.id, {
          pan: u.preferences.pan.trim().toUpperCase(),
          email: u.preferences.alertEmail || u.email,
        });
      }
    }

    // For each user with a saved PAN, check their applied IPOs
    if (userPanMap.size === 0) {
      // Default to root user / saved session if running in single-user retail terminal mode
      userPanMap.set('00000000-0000-0000-0000-000000000000', {
        pan: 'HGOPR5743G',
        email: env.GMAIL_NOTIFY_TO || env.GMAIL_USER,
      });
    }


    const { broadcastUpdate } = await import('./sseService.js');

    for (const [userId, target] of userPanMap.entries()) {
      const userIpos = await listIpos(userId);
      const candidates = userIpos.filter(
        (ipo) =>
          (ipo.isApplied || (ipo.lotsApplied ?? 0) > 0) &&
          (ipo.status === 'Applied' || ipo.status === 'Allotment Pending') &&
          isTodayOrPastIst(ipo.allotmentDate),
      );

      for (const ipo of candidates) {
        console.log(`[allotment-poller] Checking allotment for ${ipo.name} (user=${userId}, PAN=${target.pan})...`);
        const result = await checkIpoAllotment(ipo.companyName || ipo.name, target.pan);

        if (result.found && (result.status === 'ALLOTTED' || result.status === 'NOT_ALLOTTED')) {
          const newStatus = result.status === 'ALLOTTED' ? 'Allotted' : 'Not Allotted';
          const allottedLots = result.status === 'ALLOTTED' ? Math.max(1, Math.floor((result.allottedShares || 0) / (ipo.lotSize || 1))) : 0;

          await updateIpoStatus(ipo.id, newStatus, userId, allottedLots);
          broadcastUpdate('all');
          console.log(
            `[allotment-poller] Allotment status updated for ${ipo.name}: ${newStatus} (${result.allottedShares} shares, ${allottedLots} lots)`,
          );

          // Send Real-time Gmail Alert
          try {
            const { sendGmailNotification, formatEmailAllotmentAlert } = await import('./emailService.js');
            const mailData = formatEmailAllotmentAlert(ipo.name, result.status, result.allottedShares, result.registrar);
            await sendGmailNotification({
              to: target.email,
              subject: mailData.subject,
              text: mailData.text,
              html: mailData.html,
            });
            console.log(`[allotment-poller] Allotment notification email sent to ${target.email}`);
          } catch (mailErr) {
            console.error('[allotment-poller] Gmail alert dispatch failed:', mailErr);
          }
        }
      }
    }
  } catch (err) {
    console.error('[allotment-poller] Error during poll cycle:', err instanceof Error ? err.message : err);
  }
}

/**
 * Start the 1-minute allotment background poller
 */
export function startAllotmentPoller(): void {
  if (pollerInterval) return;

  console.log('[allotment-poller] Automated IPO Allotment Poller initialized (Checking every 1 min from 7:00 PM IST)');
  
  // Run once after 5 seconds to catch up
  setTimeout(() => {
    runAllotmentPollCycle().catch(() => {});
  }, 5000);

  // Poll every 60 seconds (1 minute)
  pollerInterval = setInterval(() => {
    runAllotmentPollCycle().catch(() => {});
  }, 60_000);
}

export function stopAllotmentPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}
