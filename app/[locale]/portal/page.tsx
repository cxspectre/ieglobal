'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress_percentage: number;
  start_date: string | null;
  expected_completion_date: string | null;
};

type Activity = {
  id: string;
  description: string;
  created_at: string;
};

export default function PortalPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select(`*, clients!fk_profiles_client (*)`)
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'client') {
        setLoading(false);
        if (profile?.role !== 'client') router.push('/dashboard');
        return;
      }

      setUser({ ...session.user, profile });

      if (profile.client_id) {
        const { data: projectsData } = await (supabase as any)
          .from('projects')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false });
        if (projectsData) setProjects(projectsData);

        const { data: activityData } = await (supabase as any)
          .from('activities')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (activityData) setRecentActivity(activityData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your portal...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const quickLinks = [
    { href: '/portal/milestones', label: 'Milestones', sub: 'Track progress', icon: 'flag', color: 'bg-blue-100 text-blue-700' },
    { href: '/portal/invoices', label: 'Invoices', sub: 'View & download', icon: 'document', color: 'bg-violet-100 text-violet-700' },
    { href: '/portal/files', label: 'Files', sub: 'Shared documents', icon: 'folder', color: 'bg-emerald-100 text-emerald-700' },
    { href: '/portal/messages', label: 'Messages', sub: 'Conversations', icon: 'chat', color: 'bg-amber-100 text-amber-700' },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div>
              <p className="text-white/50 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{greeting}, {firstName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData()}
                disabled={loading}
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Refresh"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Welcome / Projects overview */}
          {projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-navy-900 text-white p-8 md:p-10 shadow-lg border border-white/5"
            >
              <h2 className="text-2xl font-bold mb-3">Welcome to your portal</h2>
              <p className="text-white/80 max-w-xl">
                Your IE Global team is setting up your project. You&apos;ll see updates, milestones, and files here soon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Your projects</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-navy-900">{project.name}</h3>
                        {project.description && (
                          <p className="text-slate-600 text-sm mt-1">{project.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusStyle(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {(project.start_date || project.expected_completion_date) && (
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
                        {project.start_date && <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>}
                        {project.expected_completion_date && (
                          <span>Expected: {new Date(project.expected_completion_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Progress</span>
                        <span className="text-lg font-bold text-navy-900">{project.progress_percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-signal-red rounded-full transition-all duration-500"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 hover:border-signal-red/30 hover:bg-signal-red/5 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color} group-hover:scale-105 transition-transform`}>
                    <span className="text-lg font-bold">{link.label[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 group-hover:text-signal-red transition-colors">{link.label}</p>
                    <p className="text-xs text-slate-500">{link.sub}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Recent updates</h2>
              <ul className="space-y-3">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-signal-red flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
