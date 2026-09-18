import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export const POLL_MS = 60_000; // 1 minute fallback

// Real-time synchronization hook using Server-Sent Events (SSE)
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      try {
        es = new EventSource('/api/events');

        es.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'all' || parsed.type === 'ipos' || parsed.type === 'summary') {
              qc.invalidateQueries({ queryKey: ['ipos'] });
              qc.invalidateQueries({ queryKey: ['summary'] });
            }
          } catch {
            // ignore heartbeat/malformed events
          }
        };

        es.onerror = () => {
          if (es) {
            es.close();
            es = null;
          }
          retryTimer = setTimeout(connect, 5000);
        };
      } catch {
        retryTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (es) es.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [qc]);
}

export function useIpos(params = '') {
  return useQuery({
    queryKey: ['ipos', params],
    queryFn: () => api.listIpos(params),
    refetchInterval: POLL_MS,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useIpo(id: string | undefined) {
  return useQuery({
    queryKey: ['ipo', id],
    queryFn: () => api.getIpo(id!),
    enabled: !!id,
    refetchInterval: POLL_MS,
    staleTime: 10_000,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: api.summary,
    refetchInterval: POLL_MS,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useGmpHistory(id: string | undefined, range: string) {
  return useQuery({ queryKey: ['gmp-history', id, range], queryFn: () => api.gmpHistory(id!, range), enabled: !!id, refetchInterval: POLL_MS });
}

export function useSubHistory(id: string | undefined) {
  return useQuery({ queryKey: ['sub-history', id], queryFn: () => api.subHistory(id!), enabled: !!id });
}

// Ticking clock for countdowns / "next update in".
export function useNow(ms = 30_000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function useIpoMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['ipos'] });
    qc.invalidateQueries({ queryKey: ['summary'] });
  };
  const create = useMutation({ mutationFn: api.createIpo, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => api.updateIpo(id, payload),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['ipo', v.id] }); invalidate(); },
  });
  const remove = useMutation({ mutationFn: api.deleteIpo, onSuccess: invalidate });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.setStatus(id, status),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['ipo', v.id] }); invalidate(); },
  });
  const apply = useMutation({
    mutationFn: ({ id, applied, lotsApplied, issuePrice }: { id: string; applied: boolean; lotsApplied?: number; issuePrice?: number }) =>
      api.apply(id, applied, lotsApplied, issuePrice),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ['ipo', v.id] }); invalidate(); },
  });
  const syncLive = useMutation({
    mutationFn: api.syncLive,
    onSuccess: invalidate,
  });
  return { create, update, remove, setStatus, apply, syncLive };
}
