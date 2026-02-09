'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  expected_date: string | null;
  completed_date: string | null;
  order_index: number;
};

type Project = {
  id: string;
  name: string;
  progress_percentage: number;
};

export default function ClientMilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Get profile
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('client_id, full_name')
      .eq('id', session.user.id)
      .single();

    if (!profile?.client_id) {
      setLoading(false);
      return;
    }

    // Load projects
    const { data: projectsData } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('client_id', profile.client_id)
      .order('created_at', { ascending: false });

    if (projectsData && projectsData.length > 0) {
      setProjects(projectsData);
      setSelectedProjectId(projectsData[0].id); // Select first project
    }
    
    setLoading(false);
  };

  const loadMilestones = async (projectId: string) => {
    const { data } = await (supabase as any)
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (data) setMilestones(data);
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading milestones...</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Milestones</h1>
        <p className="text-slate-600 text-sm">Track progress on your projects</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
          <p className="text-slate-600">No projects yet. Your IE Global team will set this up soon!</p>
        </div>
      ) : (
        <>
          {projects.length > 1 && (
            <div className="mb-6 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm">
              <label className="block text-sm font-semibold text-navy-900 mb-2">Select project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentProject && (
            <div className="rounded-2xl bg-white p-6 mb-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900">{currentProject.name}</h2>
                <span className="text-2xl font-bold text-navy-900">{currentProject.progress_percentage}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal-red rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.progress_percentage}%` }}
                />
              </div>
            </div>
          )}

          {milestones.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
              <p className="text-slate-600">No milestones added yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      milestone.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {milestone.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-bold text-navy-900">{milestone.title}</h3>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          milestone.status === 'blocked' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-slate-600 text-sm mb-3">{milestone.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        {milestone.expected_date && (
                          <span>Expected: {new Date(milestone.expected_date).toLocaleDateString()}</span>
                        )}
                        {milestone.completed_date && (
                          <span className="text-emerald-700 font-medium">
                            Completed: {new Date(milestone.completed_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


