import { Router } from 'express';
import { calendarHandler, exportHandler, importHandler, summaryHandler } from '../controllers/metaController.js';

export const metaRouter = Router();
metaRouter.get('/dashboard/summary', summaryHandler);
metaRouter.get('/calendar', calendarHandler);
metaRouter.get('/export', exportHandler);
metaRouter.post('/import', importHandler);
