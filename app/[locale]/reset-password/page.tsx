'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<'request' | 'set-password' | 'checking'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const handleAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const hashParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.substring(1) : '');
        const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

        const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');

        if (errorCode === 'otp_expired') {
          if (!cancelled) {
            setError('This reset link has expired. Please request a new password reset below.');
            setMode('request');
          }
          return;
        }
        if (errorCode) {
          if (!cancelled) {
            setError(errorDesc || errorCode);
            setMode('request');
          }
          return;
        }

        const access_token = hashParams.get('access_token') || searchParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token') || searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) {
            if (!cancelled) {
              setError(sessionError.message);
              setMode('request');
            }
            return;
          }
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          if (!cancelled) {
            setSessionReady(true);
            setMode('set-password');
          }
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          setSessionReady(true);
          setMode('set-password');
          return;
        }
        if (!cancelled) setMode('request');
      } catch {
        if (!cancelled) setMode('request');
      }
    };

    handleAuth();
    return () => { cancelled = true; };
  }, []);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : '';
      const res = await fetch('/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), redirectTo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && data.error) throw new Error(data.error);
      setResetEmailSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'client') {
          router.push('/portal');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
      setLoading(false);
    }
  };

  const isRequestMode = mode === 'request';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('/grid-pattern.svg')" }} />
        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="IE Global"
              width={150}
              height={50}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6">
            {isRequestMode ? 'Reset Your Password' : 'Set Your Password'}
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            {isRequestMode
              ? 'Enter your email and we’ll send you a link to reset your password.'
              : 'Choose a secure password to access your IE Global portal.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="IE Global"
              width={120}
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </div>

          {isRequestMode ? (
            <>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Forgot password?</h2>
              <p className="text-slate-700 mb-8">
                Enter the email address for your account and we’ll send you a link to reset your password.
              </p>

              {resetEmailSent ? (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm text-emerald-900 font-medium">
                      If an account exists for <strong>{email}</strong>, we’ve sent a password reset link. Check your inbox and follow the link to set a new password.
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Didn’t receive an email? Check spam or{' '}
                    <button
                      type="button"
                      onClick={() => { setResetEmailSent(false); setError(''); }}
                      className="text-signal-red font-medium hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                  <div className="pt-4">
                    <Link href="/login" className="text-sm text-slate-700 hover:text-signal-red transition-colors">
                      ← Back to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendResetEmail} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm rounded-xl">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                      placeholder="you@company.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
                  </button>
                  <div className="text-center">
                    <Link href="/login" className="text-sm text-slate-700 hover:text-signal-red transition-colors">
                      ← Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Create your password</h2>
              <p className="text-slate-700 mb-8">
                Set a secure password for your portal account
              </p>

              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-900">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-navy-900 mb-2">
                    New password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <p className="text-xs text-slate-600 mt-1">At least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy-900 mb-2">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !sessionReady}
                  className="w-full px-8 py-4 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!sessionReady ? 'Verifying...' : loading ? 'Setting password...' : 'Set password & continue'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-slate-700 hover:text-signal-red transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


