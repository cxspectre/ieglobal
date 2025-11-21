'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

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
  const [userName, setUserName] = useState('');
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

    setUserName(profile.full_name);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-navy-900 mb-8">Project Milestones</h1>

          {projects.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700">No projects yet. Your IE Global team will set this up soon!</p>
            </div>
          ) : (
            <>
              {/* Project Selector (if multiple) */}
              {projects.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Select Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Progress Overview */}
              {currentProject && (
                <div className="bg-white p-8 mb-6 border-l-4 border-signal-red">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-navy-900">{currentProject.name}</h2>
                    <span className="text-3xl font-bold text-navy-900">{currentProject.progress_percentage}%</span>
                  </div>
                  <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-signal-red h-full transition-all duration-500" 
                      style={{ width: `${currentProject.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Milestones List */}
              {milestones.length === 0 ? (
                <div className="bg-white p-12 text-center">
                  <p className="text-slate-700">No milestones added yet. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="bg-white p-8 border-l-4 border-signal-red">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          milestone.status === 'completed' ? 'bg-green-500 text-white' :
                          milestone.status === 'in_progress' ? 'bg-blue-500 text-white' :
                          milestone.status === 'blocked' ? 'bg-red-500 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {milestone.status === 'completed' ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-navy-900">{milestone.title}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              milestone.status === 'blocked' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          {milestone.description && (
                            <p className="text-slate-700 mb-3">{milestone.description}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            {milestone.expected_date && (
                              <span>Expected: {new Date(milestone.expected_date).toLocaleDateString()}</span>
                            )}
                            {milestone.completed_date && (
                              <span className="text-green-700 font-semibold">
                                ✓ Completed: {new Date(milestone.completed_date).toLocaleDateString()}
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
      </main>
    </div>
  );
}


