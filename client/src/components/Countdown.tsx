import { useEffect, useState } from 'react';
import { countdownTo } from '../utils/format.js';

export function Countdown({ target, prefix }: { target: string | null | undefined; prefix: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const left = countdownTo(target ?? null);
  if (!left) return null;
  return (
    <span className="num inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
      {prefix} <strong className="text-white">{left}</strong>
    </span>
  );
}
