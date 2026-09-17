import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    marketFilter?: string;
    categoryFilter?: string;
    sort?: string;
  };
  createdAt: string;
}

export async function registerUser(email: string, password: string, name = ''): Promise<{ user: User; token: string }> {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail || !password || password.length < 4) {
    throw Object.assign(new Error('Valid email and password (min 4 chars) are required.'), { status: 400 });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [normEmail]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const defaultPref = { marketFilter: 'Open', categoryFilter: 'All', sort: '' };
  const res = await query<User & { created_at: Date }>(
    `INSERT INTO users (email, password_hash, name, preferences)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, preferences, created_at as "createdAt"`,
    [normEmail, hash, name.trim(), JSON.stringify(defaultPref)],
  );

  const user = res.rows[0];
  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '30d' });
  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const normEmail = email.trim().toLowerCase();
  const res = await query<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    preferences: User['preferences'];
    created_at: Date;
  }>(
    `SELECT id, email, name, password_hash, preferences, created_at FROM users WHERE email = $1`,
    [normEmail],
  );

  if (res.rows.length === 0) {
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  const row = res.rows[0];
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) {
    throw Object.assign(new Error('Invalid email or password.'), { status: 401 });
  }

  const user: User = {
    id: row.id,
    email: row.email,
    name: row.name,
    preferences: row.preferences || { marketFilter: 'Open', categoryFilter: 'All' },
    createdAt: new Date(row.created_at).toISOString(),
  };

  const token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '30d' });
  return { user, token };
}

export async function getUserById(userId: string): Promise<User | null> {
  const res = await query<{
    id: string;
    email: string;
    name: string;
    preferences: User['preferences'];
    created_at: Date;
  }>(`SELECT id, email, name, preferences, created_at FROM users WHERE id = $1`, [userId]);

  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    preferences: row.preferences || {},
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function updateUserPreferences(userId: string, prefs: Partial<User['preferences']>): Promise<User['preferences']> {
  const cur = await getUserById(userId);
  const updated = { ...(cur?.preferences || {}), ...prefs };
  await query(`UPDATE users SET preferences = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(updated), userId]);
  return updated;
}
