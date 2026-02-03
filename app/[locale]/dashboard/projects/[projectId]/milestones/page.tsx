'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

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
  clients?: { company_name: string } | null;
};

export default function MilestonesPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', expected_date: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, [params.projectId as string]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: projectData } = await (supabase as any)
      .from('projects')
      .select('*, clients(company_name)')
      .eq('id', params.projectId as string)
      .single();

    if (projectData) setProject(projectData);

    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', params.projectId as string)
      .order('order_index', { ascending: true });

    if (milestonesData) setMilestones(milestonesData);
    setLoading(false);
  };

  // Progress is derived from milestones (DB trigger keeps it in sync, but we show computed for instant feedback)
  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const computedProgress = milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await (supabase as any)
        .from('milestones')
        .insert({
          project_id: params.projectId as string,
          title: newMilestone.title,
          description: newMilestone.description || null,
          expected_date: newMilestone.expected_date || null,
          status: 'upcoming',
          order_index: milestones.length,
          created_by: session.user.id,
        });

      // Sync progress (new milestone = upcoming, so completed/total may change)
      const newTotal = milestones.length + 1;
      const progress = Math.round((completedCount / newTotal) * 100);
      await (supabase as any).from('projects').update({ progress_percentage: progress }).eq('id', params.projectId as string);

      await loadData();
      setNewMilestone({ title: '', description: '', expected_date: '' });
      setIsAdding(false);
    } catch (err: unknown) {
      alert('Failed to add: ' + (err as Error).message);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      } else {
        updateData.completed_date = null;
      }

      await (supabase as any).from('milestones').update(updateData).eq('id', milestoneId);

      // Recompute and sync progress to project (DB trigger does this too when migration is applied)
      const updated = milestones.map((m) => (m.id === milestoneId ? { ...m, status: newStatus as Milestone['status'] } : m));
      const completed = updated.filter((x) => x.status === 'completed').length;
      const total = updated.length;
      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
      await (supabase as any).from('projects').update({ progress_percentage: progress }).eq('id', params.projectId as string);

      await loadData();
    } catch (err: unknown) {
      alert('Failed to update: ' + (err as Error).message);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    try {
      await (supabase as any).from('projects').update({ status: newStatus }).eq('id', params.projectId as string);
      await loadData();
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

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

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <h1 className="text-xl font-bold text-navy-900 mb-4">Project not found</h1>
          <Link href="/dashboard/projects" className="text-signal-red font-medium hover:underline">Back to projects</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/projects"
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Back to projects"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-white/50 text-sm mt-0.5">
                  {project.clients?.company_name && (
                    <Link href={`/dashboard/clients/${project.client_id}`} className="hover:text-white transition-colors">
                      {(project.clients as { company_name?: string }).company_name}
                    </Link>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={project.status}
                onChange={(e) => updateProjectStatus(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-white/30 outline-none"
              >
                <option value="discovery">Discovery</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On hold</option>
              </select>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress — auto-calculated, read-only */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</h2>
              <span className="text-2xl font-bold text-navy-900">{computedProgress}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-signal-red rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${computedProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {completedCount} of {milestones.length} milestones completed
            </p>
          </motion.div>

          {/* Add milestone */}
          {!isAdding ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-signal-red/40 hover:bg-signal-red/5 transition-colors text-slate-600 hover:text-signal-red font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add milestone
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
            >
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">New milestone</h3>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Design mockups approved"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What needs to be done..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Expected date</label>
                  <input
                    type="date"
                    value={newMilestone.expected_date}
                    onChange={(e) => setNewMilestone((f) => ({ ...f, expected_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setNewMilestone({ title: '', description: '', expected_date: '' }); }}
                    className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Milestones list */}
          {milestones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200/80"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="font-semibold text-navy-900 mb-1">No milestones yet</p>
              <p className="text-sm text-slate-500 mb-4">Add milestones to track progress. Progress updates automatically.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="text-signal-red font-medium hover:underline"
              >
                Add first milestone →
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`rounded-2xl bg-white shadow-sm border transition-all overflow-hidden ${
                    expandedId === m.id ? 'border-signal-red/30 ring-2 ring-signal-red/10' : 'border-slate-200/80'
                  }`}
                >
                  <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50/50"
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                      m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.status === 'completed' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${m.status === 'completed' ? 'text-slate-500 line-through' : 'text-navy-900'}`}>
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {m.expected_date && `Due ${new Date(m.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        {m.completed_date && ` · Completed ${new Date(m.completed_date).toLocaleDateString('en-US')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={m.status}
                        onChange={(e) => updateMilestoneStatus(m.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer focus:ring-2 focus:ring-signal-red/20 outline-none ${getStatusStyle(m.status)}`}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Done</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button
                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                        className="p-1.5 text-slate-400 hover:text-navy-900 rounded-lg"
                        aria-label={expandedId === m.id ? 'Collapse' : 'Expand'}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${expandedId === m.id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {expandedId === m.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                      {m.description ? (
                        <p className="text-sm text-slate-600 mt-4">{m.description}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic mt-4">No description</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
