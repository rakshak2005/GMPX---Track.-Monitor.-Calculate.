import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, getAuthToken, setAuthToken } from '../services/api.js';

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    marketFilter?: 'All' | 'Open' | 'Upcoming' | 'Closed';
    sort?: string;
  };
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then((u) => setUser(u))
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshAllQueries = async () => {
    await qc.invalidateQueries();
    await Promise.all([
      qc.refetchQueries({ queryKey: ['ipos'] }),
      qc.refetchQueries({ queryKey: ['summary'] }),
    ]);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setAuthToken(res.token);
    setUser(res.user);
    await refreshAllQueries();
  };

  const register = async (email: string, pass: string, name?: string) => {
    const res = await api.register({ email, password: pass, name });
    setAuthToken(res.token);
    setUser(res.user);
    await refreshAllQueries();
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    refreshAllQueries();
  };

  const updatePreferences = async (prefs: Partial<User['preferences']>) => {
    if (!user) return;
    const updated = await api.updatePreferences(prefs);
    setUser((prev) => (prev ? { ...prev, preferences: { ...prev.preferences, ...updated } } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
