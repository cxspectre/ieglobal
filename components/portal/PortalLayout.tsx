'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import PortalSidebar from './PortalSidebar';

type PortalLayoutProps = {
  children: ReactNode;
  userType: 'employee' | 'client';
};

export default function PortalLayout({ children, userType }: PortalLayoutProps) {
  const [userName, setUserName] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('full_name, role')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name);
      if (profile.role !== 'client') {
        router.replace('/dashboard');
        return;
      }
    }
    setAuthChecked(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <PortalSidebar userName={userName} onLogout={handleLogout} />
      <main className="lg:pl-64 min-h-screen">
        <div className="pt-16 lg:pt-0 p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
