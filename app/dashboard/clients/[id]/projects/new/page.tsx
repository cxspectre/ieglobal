'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: '',
    status: 'discovery' as const,
    start_date: '',
    expected_completion_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: params.id as string,
          name: formData.name,
          description: formData.description || null,
          project_type: formData.project_type || null,
          status: formData.status,
          start_date: formData.start_date || null,
          expected_completion_date: formData.expected_completion_date || null,
          progress_percentage: 0,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Log activity
      await supabase.from('activities').insert({
        client_id: params.id as string,
        project_id: newProject.id,
        user_id: session.user.id,
        action_type: 'project_created',
        description: `Project "${formData.name}" created`,
      } as any);

      // Redirect to client detail
      router.push(`/dashboard/clients/${params.id}`);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-off-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-navy-900">
              IE Global
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Overview
              </Link>
              <Link href="/dashboard/clients" className="text-sm font-medium text-navy-900">
                Clients
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-700 hover:text-signal-red transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/dashboard/clients/${params.id}`}
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Client
            </Link>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Create New Project</h1>
            <p className="text-slate-700">Set up a project workspace for this client</p>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm">
                  {error}
                </div>
              )}

              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-navy-900 mb-2">
                  Project Name <span className="text-signal-red">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Website Redesign, Mobile App Development"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-navy-900 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what we're building..."
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                />
              </div>

              {/* Project Type */}
              <div>
                <label htmlFor="project_type" className="block text-sm font-semibold text-navy-900 mb-2">
                  Project Type
                </label>
                <select
                  id="project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                >
                  <option value="">Select type...</option>
                  <option value="website">Website</option>
                  <option value="web_app">Web Application</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="integration">Integration & Automation</option>
                  <option value="cloud_infrastructure">Cloud Infrastructure</option>
                  <option value="optimization">Performance Optimization</option>
                  <option value="ongoing_support">Ongoing Support</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-navy-900 mb-2">
                  Initial Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                >
                  <option value="discovery">Discovery</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-semibold text-navy-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="expected_completion_date" className="block text-sm font-semibold text-navy-900 mb-2">
                    Expected Completion
                  </label>
                  <input
                    type="date"
                    id="expected_completion_date"
                    value={formData.expected_completion_date}
                    onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
                <Link
                  href={`/dashboard/clients/${params.id}`}
                  className="px-8 py-3 bg-gray-100 text-navy-900 font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

