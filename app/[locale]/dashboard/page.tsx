'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type DashboardStats = {
  activeClients: number;
  totalClients: number;
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  onboardedClients: number;
};

type RecentClient = {
  id: string;
  company_name: string;
  contact_person: string;
  priority_level: string | null;
  created_at: string;
  projects?: { id: string; status: string }[];
  invoices?: { id: string; status: string }[];
};

type RecentProject = {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  clients: { company_name: string };
};

type UpcomingMilestone = {
  id: string;
  title: string;
  expected_date: string;
  project_id?: string;
  projects: { id?: string; name: string; clients: { company_name: string } };
};

function getClientStatus(c: RecentClient): 'no_project' | 'active' | 'invoiced' | 'paid' | 'stalled' {
  const projects = c.projects || [];
  const invoices = c.invoices || [];
  const hasProjects = projects.length > 0;
  const hasActiveProject = projects.some((p) => ['in_progress', 'planning', 'review'].includes(p.status));
  const hasPaidInvoice = invoices.some((i) => i.status === 'paid');
  const hasPendingInvoice = invoices.some((i) => ['pending', 'overdue'].includes(i.status));

  if (!hasProjects) return 'no_project';
  if (hasPaidInvoice) return 'paid';
  if (hasPendingInvoice) return 'invoiced';
  if (hasActiveProject) return 'active';
  return 'stalled';
}

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
  no_project: { label: 'No project', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  active: { label: 'Active', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  invoiced: { label: 'Invoiced', className: 'bg-violet-100 text-violet-800 border-violet-200' },
  paid: { label: 'Paid', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  stalled: { label: 'Stalled', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0, totalClients: 0, totalProjects: 0, inProgressProjects: 0,
    completedProjects: 0, pendingInvoices: 0, overdueInvoices: 0, totalRevenue: 0, onboardedClients: 0,
  });
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<UpcomingMilestone[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: profile } = await (supabase as any).from('profiles').select('*').eq('id', session.user.id).single();
      if (profile?.role !== 'admin' && profile?.role !== 'employee' && profile?.role !== 'partner') { router.push('/portal'); return; }
      setUser({ ...session.user, profile });

      const today = new Date().toISOString().split('T')[0];
      const [ac, tc, pr, ip, cp, pi, ov, paid, ob] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['pending', 'overdue']).lt('due_date', today),
        supabase.from('invoices').select('amount').eq('status', 'paid'),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('onboarding_status', 'completed'),
      ]);
      const totalRevenue = paid.data?.reduce((s: number, i: any) => s + i.amount, 0) || 0;
      setStats({ activeClients: ac.count || 0, totalClients: tc.count || 0, totalProjects: pr.count || 0, inProgressProjects: ip.count || 0, completedProjects: cp.count || 0, pendingInvoices: pi.count || 0, overdueInvoices: ov.count || 0, totalRevenue, onboardedClients: ob.count || 0 });

      const [cl, prj, ms] = await Promise.all([
        (supabase as any).from('clients').select('id, company_name, contact_person, priority_level, created_at, projects(id, status), invoices(id, status)').order('created_at', { ascending: false }).limit(6),
        supabase.from('projects').select('id, name, status, progress_percentage, clients(company_name)').in('status', ['in_progress', 'planning', 'review']).order('created_at', { ascending: false }).limit(4),
        supabase.from('milestones').select('id, title, expected_date, project_id, projects(id, name, clients(company_name))').gte('expected_date', today).neq('status', 'completed').order('expected_date', { ascending: true }).limit(5),
      ]);
      if (cl.data) setRecentClients(cl.data);
      if (prj.data) setRecentProjects(prj.data as any);
      if (ms.data) setUpcomingMilestones(ms.data as any);
    } catch (err: any) { setError(err?.message || 'Failed to load'); } finally { setLoading(false); }
  };

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.profile?.full_name?.split(' ')[0] || 'there';

  // Reality check: revenue flowing = at least one active project OR revenue this month
  const revenueFlowing = stats.inProgressProjects > 0 || stats.totalRevenue > 0;
  const hasOverdue = stats.overdueInvoices > 0;
  const hasMilestones = upcomingMilestones.length > 0;
  const hasPendingInvoices = stats.pendingInvoices > 0;
  const zeroProjects = stats.inProgressProjects === 0 && stats.totalProjects === 0;

  // Pipeline: which stages are stalled? (zero downstream = problem)
  const clientsStalled = stats.totalClients > 0 && stats.totalProjects === 0; // clients but no projects
  const projectsStalled = stats.totalProjects > 0 && stats.inProgressProjects === 0; // projects but none active
  const invoicesStalled = stats.pendingInvoices > 0 && stats.totalRevenue === 0; // pending but no revenue yet
  const revenueStalled = stats.totalRevenue === 0 && (stats.pendingInvoices > 0 || stats.totalProjects > 0); // work done but €0

  // Daily Briefing — executive attention management
  const today = new Date().toISOString().split('T')[0];
  const milestonesDueToday = upcomingMilestones.filter((m) => m.expected_date === today);
  const stalledClients = recentClients.filter((c) => getClientStatus(c) === 'stalled' || getClientStatus(c) === 'no_project');
  const actions: { label: string; href: string; urgency: 'high' | 'medium' }[] = [];
  if (stats.overdueInvoices > 0) actions.push({ label: `Follow up on ${stats.overdueInvoices} overdue invoice${stats.overdueInvoices > 1 ? 's' : ''}`, href: '/dashboard/invoices', urgency: 'high' });
  milestonesDueToday.slice(0, 2).forEach((m) => {
    const projId = (m as any).project_id || (m.projects as any)?.id;
    if (projId) actions.push({ label: `Complete: ${m.title}`, href: `/dashboard/projects/${projId}/milestones`, urgency: 'high' });
  });
  if (stats.overdueInvoices === 0 && upcomingMilestones.length > 0 && milestonesDueToday.length === 0) {
    const next = upcomingMilestones[0];
    const projId = (next as any).project_id || (next.projects as any)?.id;
    if (projId) actions.push({ label: `Next milestone: ${next.title} (${(next.projects as any)?.clients?.company_name})`, href: `/dashboard/projects/${projId}/milestones`, urgency: 'medium' });
  }
  if (clientsStalled && actions.length < 3) actions.push({ label: 'Create first project for a client', href: '/dashboard/clients', urgency: 'high' });
  if (projectsStalled && actions.length < 3) actions.push({ label: 'Move a project to In progress', href: '/dashboard/projects', urgency: 'high' });
  if (actions.length < 3 && stats.pendingInvoices > 0 && !actions.some((a) => a.label.includes('invoice'))) actions.push({ label: `${stats.pendingInvoices} invoice${stats.pendingInvoices > 1 ? 's' : ''} pending — follow up`, href: '/dashboard/invoices', urgency: 'medium' });
  if (stats.totalClients === 0 && stats.totalProjects === 0) actions.push({ label: 'Onboard your first client', href: '/dashboard/clients/onboard', urgency: 'high' });
  const briefingActions = actions.slice(0, 3);

  let uncomfortableTruth = '';
  if (clientsStalled) uncomfortableTruth = `${stats.totalClients} client${stats.totalClients > 1 ? 's' : ''} with zero projects. Pipeline stops here.`;
  else if (projectsStalled) uncomfortableTruth = `${stats.totalProjects} project${stats.totalProjects > 1 ? 's' : ''} and none are in progress. Work isn’t moving.`;
  else if (stats.overdueInvoices > 0 && stats.totalRevenue === 0) uncomfortableTruth = 'Invoices are overdue and €0 has been collected. Cashflow is blocked.';
  else if (stalledClients.length > 0) uncomfortableTruth = `${stalledClients.length} client${stalledClients.length > 1 ? 's' : ''} ${stalledClients.length === 1 ? 'is' : 'are'} stalled — no active project or no project at all.`;
  else if (revenueStalled) uncomfortableTruth = 'Work has been done but €0 revenue. Invoices sent? Followed up?';
  else if (stats.totalClients === 0 && stats.totalProjects === 0) uncomfortableTruth = 'No clients, no projects. Nothing to manage yet.';
  else uncomfortableTruth = 'Everything looks fine on the surface. Check what’s slipping.';

  let forwardMotion = '';
  if (stats.overdueInvoices > 0) forwardMotion = 'Send one invoice follow-up email today.';
  else if (clientsStalled) forwardMotion = 'Create one project today.';
  else if (projectsStalled) forwardMotion = 'Start one project — change status to In progress.';
  else if (stalledClients.length > 0) forwardMotion = 'Reach out to one stalled client.';
  else if (stats.pendingInvoices > 0) forwardMotion = 'Follow up on the oldest pending invoice.';
  else if (milestonesDueToday.length > 0) forwardMotion = 'Complete the milestone due today.';
  else if (upcomingMilestones.length > 0) forwardMotion = 'Move one milestone forward.';
  else if (stats.totalProjects > 0) forwardMotion = 'Update one project’s progress.';
  else forwardMotion = 'Onboard your first client.';

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav bar */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-white/50 text-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{greeting}, {firstName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {error && (
                <button onClick={() => loadDashboard()} className="px-3 py-1.5 bg-red-500/20 text-red-200 text-sm rounded-lg">Retry</button>
              )}
              <button onClick={() => loadDashboard()} disabled={loading} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Refresh">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <Link href="/dashboard/clients/onboard" className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Onboard Client
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Daily Briefing — start of day ritual */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-navy-900 text-white p-6 shadow-lg border border-white/5"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Daily Briefing</span>
              <span className="text-white/30">·</span>
              <span className="text-white/60 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Do today</p>
                <ul className="space-y-2">
                  {briefingActions.length > 0 ? (
                    briefingActions.map((a, i) => (
                      <li key={i}>
                        <Link href={a.href} className="flex items-center gap-2 text-white hover:text-signal-red transition-colors group">
                          <span className="w-1.5 h-1.5 rounded-full bg-signal-red flex-shrink-0" />
                          <span className="group-hover:underline">{a.label}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="text-white/60 text-sm">No urgent actions. Stay sharp.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Uncomfortable truth</p>
                <p className="text-white/90 text-sm leading-relaxed">{uncomfortableTruth}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Forward motion</p>
                <p className="text-signal-red font-medium text-sm">{forwardMotion}</p>
              </div>
            </div>
          </motion.div>

          {/* Pipeline — crime scene mode */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pipeline</h2>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <Link href="/dashboard/clients" className="flex items-center gap-3 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  clientsStalled ? 'bg-amber-100 ring-2 ring-amber-400 ring-offset-2' : 'bg-slate-100 group-hover:bg-signal-red/10'
                }`}>
                  <span className={`text-xl font-bold ${clientsStalled ? 'text-amber-800' : 'text-navy-900 group-hover:text-signal-red'}`}>{stats.totalClients}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Clients</p>
                  <p className={`text-xs ${clientsStalled ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
                    {clientsStalled ? `${stats.totalProjects} projects — create one` : `${stats.activeClients} active`}
                  </p>
                </div>
              </Link>
              <div className={`hidden sm:block font-bold ${clientsStalled || projectsStalled ? 'text-amber-500' : 'text-slate-300'}`}>→</div>
              <Link href="/dashboard/projects" className="flex items-center gap-3 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  projectsStalled ? 'bg-amber-100 ring-2 ring-amber-400 ring-offset-2' : 'bg-slate-100 group-hover:bg-signal-red/10'
                }`}>
                  <span className={`text-xl font-bold ${projectsStalled ? 'text-amber-800' : 'text-navy-900 group-hover:text-signal-red'}`}>{stats.totalProjects}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Projects</p>
                  <p className={`text-xs ${projectsStalled ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
                    {projectsStalled ? `0 in progress — bottleneck` : `${stats.inProgressProjects} in progress`}
                  </p>
                </div>
              </Link>
              <div className={`hidden sm:block font-bold ${invoicesStalled ? 'text-amber-500' : 'text-slate-300'}`}>→</div>
              <Link href="/dashboard/invoices" className="flex items-center gap-3 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  invoicesStalled ? 'bg-amber-100 ring-2 ring-amber-400 ring-offset-2' : 'bg-slate-100 group-hover:bg-signal-red/10'
                }`}>
                  <span className={`text-xl font-bold ${invoicesStalled ? 'text-amber-800' : 'text-navy-900 group-hover:text-signal-red'}`}>{stats.pendingInvoices}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Invoices</p>
                  <p className={`text-xs ${stats.overdueInvoices > 0 ? 'text-red-600 font-medium' : invoicesStalled ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
                    {stats.overdueInvoices > 0 ? `${stats.overdueInvoices} overdue` : invoicesStalled ? 'pending — follow up' : 'pending'}
                  </p>
                </div>
              </Link>
              <div className={`hidden sm:block font-bold ${revenueStalled ? 'text-amber-500' : 'text-slate-300'}`}>→</div>
              <Link href="/dashboard/revenue" className="flex items-center gap-3 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  revenueFlowing ? 'bg-emerald-100' : revenueStalled ? 'bg-amber-100 ring-2 ring-amber-400 ring-offset-2' : 'bg-slate-100 group-hover:bg-emerald-100'
                }`}>
                  <span className={`text-xl font-bold ${revenueFlowing ? 'text-emerald-700' : revenueStalled ? 'text-amber-800' : 'text-slate-500'}`}>€{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Revenue</p>
                  <p className={`text-xs ${revenueStalled ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
                    {revenueStalled ? '€0 — unblock cashflow' : 'paid'}
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* What Unlocks Revenue — no green lie */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">What unlocks revenue</h2>

                {hasOverdue && (
                  <Link href="/dashboard/invoices" className="flex items-center gap-4 p-4 rounded-xl bg-red-50 border border-red-200 mb-3 hover:bg-red-100/80 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-navy-900">{stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''}</p>
                      <p className="text-sm text-slate-600">Follow up — unblock cashflow</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )}

                {hasMilestones && upcomingMilestones.slice(0, 2).map((m) => (
                  <Link key={m.id} href={`/dashboard/projects/${(m as any).project_id || (m.projects as any)?.id}/milestones`} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-3 last:mb-0 hover:bg-amber-100/80 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 truncate">{m.title}</p>
                      <p className="text-sm text-slate-600 truncate">{(m.projects as any)?.clients?.company_name} · {new Date(m.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0 group-hover:text-signal-red group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}

                {!hasOverdue && !hasMilestones && (
                  <div className="space-y-3">
                    {!revenueFlowing && zeroProjects && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">0 active projects, €0 revenue</p>
                          <p className="text-sm text-slate-600">Create a project to get moving</p>
                        </div>
                      </div>
                    )}

                    {!revenueFlowing && !zeroProjects && (
                      <Link href="/dashboard/projects" className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100/80 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">0 in progress — bottleneck</p>
                          <p className="text-sm text-slate-600">No active projects = no revenue. Start one.</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    )}

                    {hasPendingInvoices && (
                      <Link href="/dashboard/invoices" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-signal-red/30 hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-signal-red/10 transition-colors">
                          <svg className="w-5 h-5 text-slate-600 group-hover:text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{stats.pendingInvoices} invoice{stats.pendingInvoices > 1 ? 's' : ''} pending</p>
                          <p className="text-sm text-slate-600">Follow up to unblock cashflow</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    )}

                    {revenueFlowing && !hasPendingInvoices && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">On track</p>
                          <p className="text-sm text-slate-600">Revenue flowing. Keep it moving.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Projects — blunt empty state */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</h2>
                  <Link href="/dashboard/projects" className="text-sm font-medium text-signal-red hover:underline">View all</Link>
                </div>
                {recentProjects.length === 0 ? (
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-10">
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </div>
                    <p className="font-bold text-navy-900 mb-1">No projects = no revenue</p>
                    <p className="text-sm text-slate-600 mb-6">Projects are how money starts moving.</p>
                    <Link
                      href={stats.totalClients > 0 ? '/dashboard/clients' : '/dashboard/clients/onboard'}
                      className="inline-flex items-center gap-2 w-full justify-center py-3.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
                    >
                      {stats.totalClients > 0 ? 'Create project' : 'Onboard a client first'}
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((p) => (
                      <Link key={p.id} href={`/dashboard/projects/${p.id}/milestones`} className="block p-4 rounded-xl border border-slate-100 hover:border-signal-red/20 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-navy-900 group-hover:text-signal-red transition-colors">{p.name}</p>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : p.status === 'review' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{p.status.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{p.clients?.company_name}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-signal-red rounded-full transition-all" style={{ width: `${p.progress_percentage ?? 0}%` }} />
                          </div>
                          <span className="text-sm font-bold text-navy-900 w-10 text-right">{p.progress_percentage ?? 0}%</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right col — clients with status chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clients</h2>
                  <Link href="/dashboard/clients" className="text-sm font-medium text-signal-red hover:underline">All</Link>
                </div>
                {recentClients.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p className="font-semibold text-navy-900 mb-1">No clients yet</p>
                    <p className="text-sm text-slate-600 mb-4">Onboard your first client to get started</p>
                    <Link href="/dashboard/clients/onboard" className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white font-medium rounded-lg hover:bg-signal-red/90 text-sm">
                      Onboard client
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentClients.map((c) => {
                      const status = getClientStatus(c);
                      const chip = STATUS_CHIP[status];
                      return (
                        <Link key={c.id} href={`/dashboard/clients/${c.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover:bg-signal-red transition-colors">{c.company_name.charAt(0)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-navy-900 truncate group-hover:text-signal-red transition-colors">{c.company_name}</p>
                            <p className="text-xs text-slate-500 truncate">{c.contact_person}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${chip.className}`}>{chip.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link href="/dashboard/clients/new" className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 text-white font-medium hover:bg-signal-red transition-colors text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add client
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
