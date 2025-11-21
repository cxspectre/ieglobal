'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: 'upcoming' | 'in_progress' | 'completed' | 'blocked';
  expected_date: string | null;
  completed_date: string | null;
  order_index: number;
};

type Project = {
  id: string;
  name: string;
  client_id: string;
  status: string;
  progress_percentage: number;
};

export default function MilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    expected_date: '',
  });
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, [params.projectId]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    // Load project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.projectId)
      .single();

    if (projectData) setProject(projectData);

    // Load milestones
    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', params.projectId)
      .order('order_index', { ascending: true });

    if (milestonesData) setMilestones(milestonesData);
    
    setLoading(false);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('milestones')
        .insert({
          project_id: params.projectId as string,
          title: newMilestone.title,
          description: newMilestone.description || null,
          expected_date: newMilestone.expected_date || null,
          status: 'upcoming',
          order_index: milestones.length,
          created_by: session.user.id,
        } as any);

      if (error) throw error;

      // Reload milestones
      await loadData();
      setNewMilestone({ title: '', description: '', expected_date: '' });
      setIsAdding(false);
    } catch (err: any) {
      console.error('Error adding milestone:', err);
      alert('Failed to add milestone: ' + err.message);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await (supabase as any)
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId);

      if (error) throw error;

      // Reload
      await loadData();
    } catch (err: any) {
      console.error('Error updating milestone:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('projects')
        .update({ status: newStatus })
        .eq('id', params.projectId);

      if (error) throw error;

      // Reload project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.projectId)
        .single();

      if (projectData) setProject(projectData);
    } catch (err: any) {
      console.error('Error updating project status:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const updateProgress = async (newProgress: number) => {
    try {
      const { error } = await (supabase as any)
        .from('projects')
        .update({ progress_percentage: newProgress })
        .eq('id', params.projectId);

      if (error) throw error;

      // Reload project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.projectId)
        .single();

      if (projectData) setProject(projectData);
    } catch (err: any) {
      console.error('Error updating progress:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading milestones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {project && (
              <Link
                href={`/dashboard/clients/${project.client_id}`}
                className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Client
              </Link>
            )}
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              {project?.name || 'Project'} - Milestones
            </h1>
            <p className="text-slate-700">Track and manage project milestones</p>
          </div>

          {/* Project Status & Progress Card */}
          {project && (
            <div className="bg-white p-8 mb-6 border-l-4 border-signal-red">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Project Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Selector */}
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-3">
                    Current Stage
                  </label>
                  <select
                    value={project.status}
                    onChange={(e) => updateProjectStatus(e.target.value)}
                    className={`w-full px-4 py-3 text-base font-semibold border-2 cursor-pointer transition-all duration-200 ${
                      project.status === 'completed' ? 'bg-green-50 border-green-500 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-50 border-blue-500 text-blue-800' :
                      project.status === 'review' ? 'bg-purple-50 border-purple-500 text-purple-800' :
                      project.status === 'on_hold' ? 'bg-red-50 border-red-500 text-red-800' :
                      'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="discovery">Discovery</option>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                {/* Progress Slider */}
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-3">
                    Overall Progress: {project.progress_percentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={project.progress_percentage}
                    onChange={(e) => updateProgress(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-signal-red"
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Milestone Button */}
          {!isAdding && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Milestone</span>
              </button>
            </div>
          )}

          {/* Add Milestone Form */}
          {isAdding && (
            <div className="bg-white p-8 mb-6 border-l-4 border-signal-red">
              <h3 className="text-xl font-bold text-navy-900 mb-6">New Milestone</h3>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Title <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    placeholder="e.g., Design Mockups Approved"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    placeholder="What needs to be done..."
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Expected Date
                  </label>
                  <input
                    type="date"
                    value={newMilestone.expected_date}
                    onChange={(e) => setNewMilestone({ ...newMilestone, expected_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                  >
                    Add Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setNewMilestone({ title: '', description: '', expected_date: '' });
                    }}
                    className="px-6 py-3 bg-gray-100 text-navy-900 font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Milestones List */}
          {milestones.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700 mb-6">No milestones yet. Add your first milestone to track progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="bg-white p-8 border-l-4 border-signal-red">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-signal-red text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-navy-900 mb-2">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-slate-700 mb-3">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {milestone.expected_date && (
                            <span>Expected: {new Date(milestone.expected_date).toLocaleDateString()}</span>
                          )}
                          {milestone.completed_date && (
                            <span className="text-green-700 font-semibold">
                              Completed: {new Date(milestone.completed_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={milestone.status}
                      onChange={(e) => updateMilestoneStatus(milestone.id, e.target.value)}
                      className={`px-4 py-2 text-sm font-semibold border-2 cursor-pointer transition-colors duration-200 ${
                        milestone.status === 'completed' ? 'bg-green-50 border-green-500 text-green-800' :
                        milestone.status === 'in_progress' ? 'bg-blue-50 border-blue-500 text-blue-800' :
                        milestone.status === 'blocked' ? 'bg-red-50 border-red-500 text-red-800' :
                        'bg-gray-50 border-gray-300 text-gray-800'
                      }`}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}

