'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import PortalNav from '@/components/portal/PortalNav';

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

      // Get profile with client info - specify the relationship explicitly
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

      console.log('Client profile:', profile);
      console.log('Client ID:', profile.client_id);
      console.log('Company:', profile.clients);

      // Load projects for this client
      if (profile.client_id) {
        const { data: projectsData, error: projectsError } = await (supabase as any)
          .from('projects')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false });

        console.log('Projects query result:', { projectsData, projectsError });

        if (projectsData) {
          setProjects(projectsData);
        }

        // Load recent activity
        const { data: activityData } = await (supabase as any)
          .from('activities')
          .select('*')
          .eq('client_id', profile.client_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activityData) {
          setRecentActivity(activityData);
        }
      } else {
        console.error('❌ No client_id set on profile! This is the problem.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setLoading(false);
    }
  }; // Remove dependencies to prevent re-checking

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <PortalNav 
        userType="client" 
        userName={user?.profile?.full_name}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              Welcome, {user?.profile?.full_name}
            </h1>
            <p className="text-slate-700">
              Track your project progress and stay connected with IE Global
            </p>
          </div>

          {/* Projects Overview */}
          {projects.length === 0 ? (
            <div className="bg-white p-12 text-center mb-8 border-l-4 border-signal-red">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">
                Welcome to Your Portal
              </h2>
              <p className="text-slate-700">
                Your IE Global team is setting up your project. You'll see updates here soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white p-8 border-l-4 border-signal-red">
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-2xl font-bold text-navy-900 mb-2">
                          {project.name}
                        </h2>
                        {project.description && (
                          <p className="text-slate-700">{project.description}</p>
                        )}
                      </div>
                      <span className={`px-4 py-2 text-sm font-semibold ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {(project.start_date || project.expected_completion_date) && (
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        {project.start_date && (
                          <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
                        )}
                        {project.expected_completion_date && (
                          <span>Expected: {new Date(project.expected_completion_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-navy-900">Progress</span>
                      <span className="text-2xl font-bold text-navy-900">{project.progress_percentage}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-signal-red h-full transition-all duration-500" 
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 border-l-4 border-signal-red">
              <p className="text-sm text-slate-700 mb-2">Active Projects</p>
              <p className="text-3xl font-bold text-navy-900">{projects.length}</p>
            </div>
            <Link href="/portal/milestones" className="bg-white p-6 border-l-4 border-blue-500 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-sm text-slate-700 mb-2">View Milestones</p>
              <p className="text-2xl font-bold text-navy-900">→</p>
            </Link>
            <Link href="/portal/invoices" className="bg-white p-6 border-l-4 border-purple-500 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-sm text-slate-700 mb-2">View Invoices</p>
              <p className="text-2xl font-bold text-navy-900">→</p>
            </Link>
            <Link href="/portal/files" className="bg-white p-6 border-l-4 border-teal-500 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-sm text-slate-700 mb-2">View Files</p>
              <p className="text-2xl font-bold text-navy-900">→</p>
            </Link>
            <Link href="/portal/messages" className="bg-white p-6 border-l-4 border-orange-500 hover:bg-gray-50 transition-colors duration-200">
              <p className="text-sm text-slate-700 mb-2">Messages</p>
              <p className="text-2xl font-bold text-navy-900">→</p>
            </Link>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="bg-white p-8">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Recent Updates</h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 bg-signal-red rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

