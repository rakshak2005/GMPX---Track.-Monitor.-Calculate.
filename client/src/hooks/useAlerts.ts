import { useEffect, useRef } from 'react';
import type { Ipo } from '../types/ipo.js';

// In-app + browser notifications for GMP / subscription / date alerts.
// Structured so email/Telegram/WhatsApp senders can be plugged in later
// (see server jobs — add a notifier interface mirroring this logic).
export interface AlertRule {
  gmpAbove?: number;
  gmpMove?: number; // absolute move since previous poll
  subAbove?: number;
}

const SETTINGS_KEY = 'gmpulse-settings';

export function getSettings(): { notifications: boolean; rules: AlertRule } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw) as { notifications?: boolean; gmpAbove?: number; gmpMove?: number; subAbove?: number };
      return { notifications: s.notifications !== false, rules: { gmpAbove: s.gmpAbove, gmpMove: s.gmpMove, subAbove: s.subAbove } };
    }
  } catch { /* ignore */ }
  return { notifications: true, rules: {} };
}

export function pushToast(title: string, body: string): void {
  window.dispatchEvent(new CustomEvent('gmpulse-toast', { detail: { title, body } }));
  const { notifications } = getSettings();
  if (notifications && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body }); } catch { /* ignore */ }
  }
}

export function useGmpAlerts(ipos: Ipo[] | undefined): void {
  const prev = useRef(new Map<string, number>());
  useEffect(() => {
    if (!ipos) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
    const { rules } = getSettings();
    for (const ipo of ipos) {
      const g = ipo.currentGmp;
      if (g === null || g === undefined) continue;
      const last = prev.current.get(ipo.id);
      if (last !== undefined && last !== g) {
        const diff = g - last;
        pushToast('GMP Updated', `${ipo.name}\n₹${last} → ₹${g} (${diff >= 0 ? '+' : ''}₹${diff})`);
        if (rules.gmpMove && Math.abs(diff) >= rules.gmpMove) {
          pushToast('GMP Alert', `${ipo.name} moved ₹${diff} to ₹${g}`);
        }
      }
      if (rules.gmpAbove && g >= rules.gmpAbove && (last === undefined || last < rules.gmpAbove)) {
        pushToast('GMP Alert', `${ipo.name} crossed ₹${rules.gmpAbove} (now ₹${g})`);
      }
      const total = ipo.subscription?.total;
      if (rules.subAbove && total != null && total >= rules.subAbove) {
        const key = `${ipo.id}:sub`;
        if (!prev.current.has(key)) pushToast('Subscription Alert', `${ipo.name} crossed ${rules.subAbove}x (now ${total}x)`);
        prev.current.set(key, total);
      }
      prev.current.set(ipo.id, g);
    }
  }, [ipos]);
}
