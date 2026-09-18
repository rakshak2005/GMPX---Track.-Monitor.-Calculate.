import { Response } from 'express';

type Client = {
  id: number;
  res: Response;
};

const clients = new Set<Client>();
let counter = 0;

export function addSseClient(res: Response): () => void {
  const client: Client = { id: ++counter, res };
  clients.add(client);
  return () => {
    clients.delete(client);
  };
}

export function broadcastUpdate(type: 'ipos' | 'summary' | 'gmp' | 'all', data?: unknown): void {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  for (const client of clients) {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}
