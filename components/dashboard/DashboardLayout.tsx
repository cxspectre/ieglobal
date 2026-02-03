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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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
