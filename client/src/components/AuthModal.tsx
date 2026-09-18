import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, UserPlus, Lock, Mail, User, X } from 'lucide-react';
import { pushToast } from '../hooks/useAlerts.js';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      pushToast('Error', 'Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        pushToast('Welcome!', 'Your account has been created on Neon database.');
      } else {
        await login(email, password);
        pushToast('Welcome Back', 'Signed in successfully.');
      }
      onClose();
    } catch (err: any) {
      pushToast('Authentication failed', err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:p-4 sm:items-center backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-sm !bg-[#0b1020] p-6 shadow-2xl relative rounded-t-2xl sm:rounded-2xl border-b-0 sm:border-b max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
            {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
          </div>
          <h2 className="text-lg font-bold text-white">
            {isRegister ? 'Create Your Account' : 'Sign in to GMPX'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRegister
              ? 'Save your personal IPO bids & preferences on Neon PostgreSQL'
              : 'Access your saved applied IPOs and custom settings'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-blue-500 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            {submitting ? 'Please wait…' : isRegister ? 'Register & Save' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="text-blue-400 hover:underline font-medium">
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account yet?{' '}
              <button onClick={() => setIsRegister(true)} className="text-emerald-400 hover:underline font-medium">
                Register free
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
