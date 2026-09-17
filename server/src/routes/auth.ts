import { Router } from 'express';
import { registerUser, loginUser, getUserById, updateUserPreferences } from '../services/authService.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body ?? {};
    const result = await registerUser(String(email || ''), String(password || ''), String(name || ''));
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await loginUser(String(email || ''), String(password || ''));
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

authRouter.put('/preferences', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const prefs = req.body?.preferences ?? req.body ?? {};
    const updated = await updateUserPreferences(req.userId!, prefs);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});
