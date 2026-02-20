'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui/Logo';

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
      {/* Left Side - Branding with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden">
        <Image
          src="/pexels-bibekghosh-14553701.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-navy-900/75" />
        <div className="relative z-10">
          <Logo width={150} height={50} href="/" className="h-12 w-auto" invert />
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
      <div className="flex-1 flex items-center justify-center p-8 bg-off-white">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo width={120} height={40} href="/" className="h-10 w-auto mx-auto" />
          </div>

          <div className="bg-white p-8 md:p-10 rounded-none shadow-lg border border-gray-200">
            <h2 className="font-serif text-3xl font-bold text-navy-900 mb-2">Sign In</h2>
            <p className="font-sans text-slate-700 mb-8">
              Access your project dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm rounded-none">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2 font-sans">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-none focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900 transition-all duration-200 font-sans"
                  placeholder="you@company.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-navy-900 font-sans">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-sm text-signal-red hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-none focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900 transition-all duration-200 font-sans"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-signal-red text-white font-semibold rounded-none hover:bg-signal-red/90 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200">
                ← Back to IE Global
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
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

