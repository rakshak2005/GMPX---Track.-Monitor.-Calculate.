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

metaRouter.post('/notify/email-test', async (req, res) => {
  const { email, ipoName, status, shares, registrar } = req.body ?? {};
  const { sendGmailNotification, formatEmailAllotmentAlert } = await import('../services/emailService.js');

  if (status) {
    const alertData = formatEmailAllotmentAlert(
      ipoName || 'Tata Technologies Ltd (Sample Allotment)',
      status === 'NOT_ALLOTTED' ? 'NOT_ALLOTTED' : 'ALLOTTED',
      shares || 30,
      registrar || 'Link Intime India Pvt Ltd'
    );
    const result = await sendGmailNotification({
      to: email,
      subject: alertData.subject,
      text: alertData.text,
      html: alertData.html,
    });
    return res.json({ data: result });
  }

  const result = await sendGmailNotification({
    to: email,
    subject: `🚀 GMPX Terminal - Gmail Allotment Alerts Active!`,
    text: `Your email is now connected to the GMPX Automated 7:00 PM Allotment Poller Engine.\n\nYou will receive instant notifications whenever an IPO allotment result is declared.`,
  });
  res.json({ data: result });
});



