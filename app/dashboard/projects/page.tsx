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
  end_date: string | null;
  clients: {
    id: string;
    company_name: string;
  } | null;
};

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    // Check for status in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status) {
        setStatusFilter(status);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      applyFilters();
    }
  }, [statusFilter, projects]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
        return;
      }

      await loadProjects();
    } catch (err) {
      console.error('Auth check error:', err);
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // Load all projects with client info
      const { data: projectsData, error: projectsError } = await (supabase as any)
        .from('projects')
        .select(`
          *,
          clients!inner(id, company_name)
        `)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else {
        setProjects(projectsData || []);
        setFilteredProjects(projectsData || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading projects:', err);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proj => proj.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Projects</h1>
          <p className="text-lg text-slate-700">
            Manage all client projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <label htmlFor="statusFilter" className="block text-sm font-semibold text-navy-900">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 text-center border border-gray-200">
          <p className="text-slate-700 text-lg">No projects found.</p>
          <Link
            href="/dashboard/clients"
            className="mt-4 inline-block text-signal-red hover:text-signal-red/80 font-semibold"
          >
            Create your first project →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}/milestones`}
              className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-signal-red transition-colors duration-200">
                      {project.name}
                    </h3>
                    {project.clients && (
                      <Link
                        href={`/dashboard/clients/${project.clients.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-signal-red hover:text-signal-red/80 font-semibold"
                      >
                        {project.clients.company_name}
                      </Link>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Progress</span>
                    <span className="text-xs font-bold text-navy-900">{project.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-signal-red h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-gray-100">
                  <div>
                    <span className="font-semibold">Start:</span> {formatDate(project.start_date)}
                  </div>
                  {project.end_date && (
                    <div>
                      <span className="font-semibold">End:</span> {formatDate(project.end_date)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredProjects.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-navy-900">{filteredProjects.length}</p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredProjects.filter(p => p.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredProjects.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white p-6 border border-gray-200">
            <p className="text-sm text-slate-600 mb-1">Avg. Progress</p>
            <p className="text-3xl font-bold text-navy-900">
              {filteredProjects.length > 0
                ? Math.round(
                    filteredProjects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) /
                      filteredProjects.length
                  )
                : 0}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

