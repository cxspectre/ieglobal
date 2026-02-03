'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const check = async () => {
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
      setLoading(false);
    };
    check();
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
                <h1 className="text-xl sm:text-2xl font-bold text-white">Company</h1>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Legal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">Company</p>
                <p className="font-bold text-navy-900">IE Global</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">KVK</p>
                <p className="font-bold text-navy-900 font-mono">97185515</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">VAT</p>
                <p className="font-bold text-navy-900 font-mono">NL737599054B02</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Banking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">IBAN</p>
                <p className="font-bold text-navy-900 font-mono">NL48 QNTO 9386 8485 87</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">BIC/SWIFT</p>
                <p className="font-bold text-navy-900 font-mono">QNTONL22XXX</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Contact</h2>
            <div className="flex flex-wrap gap-6">
              <a href="mailto:hello@ie-global.net" className="text-signal-red font-medium hover:underline">hello@ie-global.net</a>
              <a href="https://ie-global.net" target="_blank" rel="noopener noreferrer" className="text-signal-red font-medium hover:underline">ie-global.net</a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
