'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle token from URL if present, otherwise check session
    const handleAuth = async () => {
      const supabase = createBrowserClient();
      
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for error in URL first
      const errorCode = hashParams.get('error_code');
      const errorDesc = hashParams.get('error_description');
      
      if (errorCode === 'otp_expired') {
        setError('⏰ This invitation link has expired (links are valid for 1 hour).\n\nPlease contact your administrator to resend the invitation, or use the "Resend Invite" button in the Command Center.');
        return;
      }
      
      if (errorCode) {
        setError(`Link error: ${errorDesc || errorCode}. Please request a new invitation.`);
        return;
      }
      
      // Try to get tokens from hash
      let access_token = hashParams.get('access_token');
      let refresh_token = hashParams.get('refresh_token');

      // If not in hash, try query params
      if (!access_token) {
        const searchParams = new URLSearchParams(window.location.search);
        access_token = searchParams.get('access_token');
        refresh_token = searchParams.get('refresh_token');
      }

      if (access_token && refresh_token) {
        console.log('Setting session from URL tokens');
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          console.error('Failed to set session:', sessionError);
          setError(`Failed to verify link: ${sessionError.message}. Please request a new invitation.`);
          return;
        }

        // Clear the hash/query from URL
        window.history.replaceState(null, '', window.location.pathname);
        setSessionReady(true);
        return;
      }

      // Check if session already exists
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Reset password page - session:', session);
      
      if (!session) {
        setError('Auth session missing! Please request a new invitation from your administrator.');
        return;
      }
      
      setSessionReady(true);
    };
    
    handleAuth();
  }, []);

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

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Get user role to redirect properly
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Redirect based on role
        if (profile?.role === 'client') {
          alert('Password set successfully! Redirecting to your portal...');
          router.push('/portal');
        } else {
          alert('Password set successfully! Redirecting to dashboard...');
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
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
            Set Your Password
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Choose a secure password to access your IE Global portal.
          </p>
        </div>
      </div>

      {/* Right Side - Reset Form */}
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

          <h2 className="text-3xl font-bold text-navy-900 mb-2">Create Your Password</h2>
          <p className="text-slate-700 mb-8">
            Set a secure password for your portal account
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-900 mb-3">{error}</p>
                {error.includes('expired') && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-900 font-semibold mb-2">How to get a new invitation:</p>
                    <ol className="text-sm text-yellow-900 space-y-1 ml-4 list-decimal">
                      <li>Contact your IE Global administrator</li>
                      <li>They can resend your invitation from Command Center → Team Management</li>
                      <li>You'll receive a new email with a fresh link (valid for 1 hour)</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-navy-900 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-slate-600 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy-900 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!sessionReady ? 'Verifying...' : loading ? 'Setting Password...' : 'Set Password & Access Portal'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


