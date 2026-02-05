'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import DashboardSidebar from './DashboardSidebar';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'employee' | 'partner' | 'client' | undefined>();
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
      setUserRole(profile.role);
      if (profile.role === 'client') {
        router.replace('/portal');
        return;
      }
    }
    setAuthChecked(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Don't render dashboard UI until auth is verified (avoids showing content when session expired)
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
      <DashboardSidebar
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />
      {/* Main content - offset by sidebar width on desktop */}
      <main className="lg:pl-64 min-h-screen">
        <div className="pt-16 lg:pt-0 p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
