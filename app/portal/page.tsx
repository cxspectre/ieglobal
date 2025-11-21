'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress_percentage: number;
  start_date: string | null;
  expected_completion_date: string | null;
};

export default function PortalPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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

      // Get profile with client info
      const { data: profile, error } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          clients!fk_profiles_client (*)
        `)
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setLoading(false);
        return;
      }

      if (profile?.role !== 'client') {
        router.push('/dashboard');
        return;
      }

      setUser({ ...session.user, profile });

      // Load projects
      if (profile.client_id) {
        const { data: projectsData } = await (supabase as any)
          .from('projects')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false });

        if (projectsData) setProjects(projectsData);

        // Load recent activity
        const { data: activityData } = await (supabase as any)
          .from('activities')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false })
          .limit(6);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-navy-900 mb-3">
            Welcome back, {user?.profile?.full_name?.split(' ')[0]} 👋
            </h1>
          <p className="text-xl text-slate-700">
            Track your projects and stay updated with IE Global
            </p>
          </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Link href="/portal/milestones" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-signal-red/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 text-sm mb-1">Milestones</p>
              <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors duration-200">View progress →</p>
            </div>
          </Link>

          <Link href="/portal/invoices" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-navy-900/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 text-sm mb-1">Invoices</p>
              <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors duration-200">View invoices →</p>
            </div>
          </Link>

          <Link href="/portal/files" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-navy-900/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 text-sm mb-1">Files</p>
              <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors duration-200">Browse files →</p>
            </div>
          </Link>

          <Link href="/portal/messages" className="group">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-navy-900/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-bold text-navy-900 text-sm mb-1">Messages</p>
              <p className="text-xs text-slate-600 group-hover:text-signal-red transition-colors duration-200">Open chat →</p>
            </div>
          </Link>
        </div>

        {/* Projects */}
          {projects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
                Welcome to Your Portal
              </h2>
            <p className="text-slate-600">
                Your IE Global team is setting up your project. You'll see updates here soon!
              </p>
            </div>
          ) : (
          <div className="space-y-6 mb-10">
              {projects.map((project) => (
              <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-l-4 border-signal-red">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                        <h2 className="text-2xl font-bold text-navy-900 mb-2">
                          {project.name}
                        </h2>
                        {project.description && (
                          <p className="text-slate-700">{project.description}</p>
                        )}
                      </div>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {(project.start_date || project.expected_completion_date) && (
                  <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
                        {project.start_date && (
                      <span>Started: {new Date(project.start_date).toLocaleDateString('en-GB')}</span>
                        )}
                        {project.expected_completion_date && (
                      <span>Expected: {new Date(project.expected_completion_date).toLocaleDateString('en-GB')}</span>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-navy-900">Project Progress</span>
                      <span className="text-2xl font-bold text-navy-900">{project.progress_percentage}%</span>
                    </div>
                  <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                        <div 
                      className="bg-gradient-to-r from-signal-red to-red-600 h-full transition-all duration-500" 
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Recent Updates</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-signal-red/10 flex items-center justify-center flex-shrink-0 border-2 border-signal-red">
                      <div className="w-2 h-2 bg-signal-red rounded-full" />
                    </div>
                    {index < recentActivity.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-slate-700 leading-relaxed">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
    </div>
  );
}
