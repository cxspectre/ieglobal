'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/showcase/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Invalid password.');
        return;
      }
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400/90">
              <LockIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">
              Access required
            </span>
          </div>
          <h1 className="text-xl font-light tracking-tight text-white text-center mb-2">
            This page is private
          </h1>
          <p className="text-white/35 text-sm text-center mb-8 font-light">
            Enter the password to view the showcase.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-colors"
            />
            {error && (
              <p className="text-amber-400/90 text-xs text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400/90 px-4 py-3 text-sm font-medium hover:bg-amber-500/30 hover:border-amber-500/40 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Checking…' : 'Enter'}
            </button>
          </form>
          <p className="mt-8 text-[10px] font-mono text-white/20 text-center">
            Not indexed · Invite only
          </p>
        </div>
      </div>
    </>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
