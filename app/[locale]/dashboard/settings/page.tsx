'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy' });
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin' && profile?.role !== 'employee' && profile?.role !== 'partner') {
        router.push('/portal');
        return;
      }
      try {
        await supabase.from('clients').select('id').limit(1);
        await supabase.storage.listBuckets();
        setSystemHealth({ database: 'healthy', storage: 'healthy' });
      } catch {
        setSystemHealth({ database: 'error', storage: 'error' });
      }
      setLoading(false);
    };
    load();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg" aria-label="Back">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              systemHealth.database === 'healthy' ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-red-500/20 border border-red-400/30'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${systemHealth.database === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-sm font-semibold text-white">
                {systemHealth.database === 'healthy' ? 'All systems operational' : 'System issues'}
              </span>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[700px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">External services</h2>
            <div className="space-y-3">
              {[
                { name: 'Supabase', desc: 'Database, auth & storage', url: 'https://supabase.com/dashboard' },
                { name: 'Resend', desc: 'Email delivery', url: 'https://resend.com/emails' },
                { name: 'Vercel', desc: 'Hosting & deployment', url: 'https://vercel.com/dashboard' },
                { name: 'GitHub', desc: 'Source code', url: 'https://github.com/cxspectre/ieglobal' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-signal-red/30 hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-navy-900 group-hover:text-signal-red">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
