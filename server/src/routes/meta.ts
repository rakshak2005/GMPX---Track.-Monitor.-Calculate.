import { Router } from 'express';
import { calendarHandler, exportHandler, importHandler, summaryHandler } from '../controllers/metaController.js';
import { addSseClient } from '../services/sseService.js';

export const metaRouter = Router();
metaRouter.get('/dashboard/summary', summaryHandler);
metaRouter.get('/calendar', calendarHandler);
metaRouter.get('/export', exportHandler);
metaRouter.post('/import', importHandler);

metaRouter.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.write(': heartbeat\n\n');

  const remove = addSseClient(res);

  // Send periodic heartbeat to keep connection alive across proxies
  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(ping);
      remove();
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    remove();
  });
});
