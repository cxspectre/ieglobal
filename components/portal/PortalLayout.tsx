'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import PortalNav from './PortalNav';

type PortalLayoutProps = {
  children: ReactNode;
  userType: 'employee' | 'client';
};

export default function PortalLayout({ children, userType }: PortalLayoutProps) {
  const [userName, setUserName] = useState('');
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
      .select('full_name')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-off-white">
      <PortalNav 
        userType={userType} 
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}

