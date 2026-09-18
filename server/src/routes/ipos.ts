import { Router } from 'express';
import {
  applyIpoHandler, checkAllotmentHandler, createIpoHandler, deleteIpoHandler, getIpoHandler, listIposHandler,
  registrarActiveIssuesHandler, subHistoryHandler, syncLiveHandler, updateIpoHandler, updateStatusHandler, updateSubscriptionHandler,
} from '../controllers/ipoController.js';
import { getGmpHandler, gmpHistoryHandler, refreshGmpHandler } from '../controllers/gmpController.js';

// Auth intentionally simple for v1 (no login). When JWT_SECRET is set,
// insert auth middleware here and scope store queries by req.userId.
// IPO documents already carry an optional `userId` field for that upgrade.
export const ipoRouter = Router();

ipoRouter.get('/', listIposHandler);
ipoRouter.get('/registrar-issues', registrarActiveIssuesHandler);
ipoRouter.post('/', createIpoHandler);
ipoRouter.post('/sync', syncLiveHandler);
ipoRouter.get('/:id', getIpoHandler);
ipoRouter.put('/:id', updateIpoHandler);
ipoRouter.post('/:id/apply', applyIpoHandler);
ipoRouter.delete('/:id', deleteIpoHandler);
ipoRouter.put('/:id/status', updateStatusHandler);
ipoRouter.post('/:id/check-allotment', checkAllotmentHandler);
ipoRouter.put('/:id/subscription', updateSubscriptionHandler);
ipoRouter.post('/:id/subscription/snapshot', updateSubscriptionHandler);
ipoRouter.get('/:id/subscription/history', subHistoryHandler);
ipoRouter.get('/:id/gmp', getGmpHandler);
ipoRouter.post('/:id/gmp/refresh', refreshGmpHandler);
ipoRouter.get('/:id/gmp/history', gmpHistoryHandler);
