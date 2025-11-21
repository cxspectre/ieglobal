'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      console.log('Logged in user ID:', authData.user.id);
      console.log('Auth user email:', authData.user.email);

      // Try to get profile - wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('Profile query result:', { profile, profileError });
      console.log('Full error:', profileError);

      if (profileError) {
        console.error('Profile error details:', profileError);
        throw new Error(`Database error: ${profileError.message}. Your profile exists but RLS policies might be blocking access. Check Supabase logs.`);
      }

      if (!profile) {
        throw new Error(`Profile row not found. Please verify in Supabase Table Editor that a profile exists with id="${authData.user.id}"`);
      }

      // Redirect based on role
      if (profile?.role === 'client') {
        router.push('/portal');
      } else if (profile?.role === 'admin' || profile?.role === 'employee') {
        router.push('/dashboard');
      } else {
        throw new Error('Access denied. Your account role is not set. Please contact support at hello@ie-global.net');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
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
            Welcome to IE Global Portal
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Your project workspace. Track progress, view milestones, and communicate with your team—all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
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

          <h2 className="text-3xl font-bold text-navy-900 mb-2">Sign In</h2>
          <p className="text-slate-700 mb-8">
            Access your project dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm rounded">
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
                className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200">
              ← Back to IE Global
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-slate-700">
              Need help accessing your account?{' '}
              <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline font-semibold">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

