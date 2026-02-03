'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  status: string;
  website: string | null;
  onboarding_status: string | null;
  priority_level: string | null;
  expected_timeline: string | null;
  service_category: string | null;
  estimated_scope: string | null;
  created_at: string;
  address_street?: string | null;
  address_city?: string | null;
  address_postal_code?: string | null;
  address_country?: string | null;
  vat_number?: string | null;
  kvk_number?: string | null;
};

type OnboardingData = {
  service_categories: string[];
  project_lead_id: string | null;
  technical_lead_id: string | null;
  documents_requested: string[];
  documents_received: string[];
  kickoff_meeting_scheduled: boolean;
  kickoff_meeting_date: string | null;
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
};

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  projects: { name: string } | null;
};

type UploadedFile = {
  file_name: string;
  storage_path: string;
  created_at: string;
};

type Message = {
  id: string;
  message_text: string;
  created_at: string;
  sender_id: string;
  is_internal: boolean;
  profiles: { full_name: string; role: string };
};

export default function ClientDetailPage() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectLead, setProjectLead] = useState('');
  const [technicalLead, setTechnicalLead] = useState('');
  const [clientHasAccount, setClientHasAccount] = useState(false);
  const [clientAccountEmail, setClientAccountEmail] = useState('');
  const [clientAccountActive, setClientAccountActive] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});

  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, [params.id as string]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id as string)
      .single();

    if (clientData) setClient(clientData);

    const { data: onboarding } = await (supabase as any)
      .from('client_onboarding_data')
      .select('*')
      .eq('client_id', params.id as string)
      .single();

    if (onboarding) {
      setOnboardingData(onboarding);
      if (onboarding.project_lead_id) {
        const { data: lead } = await supabase.from('profiles').select('full_name').eq('id', onboarding.project_lead_id).single();
        if (lead) setProjectLead((lead as { full_name: string }).full_name);
      }
      if (onboarding.technical_lead_id) {
        const { data: tech } = await supabase.from('profiles').select('full_name').eq('id', onboarding.technical_lead_id).single();
        if (tech) setTechnicalLead((tech as { full_name: string }).full_name);
      }
    }

    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, status, progress_percentage')
      .eq('client_id', params.id as string)
      .order('created_at', { ascending: false });

    if (projectsData) setProjects(projectsData as Project[]);

    const { data: invoicesData } = await (supabase as any)
      .from('invoices')
      .select('id, invoice_number, amount, status, due_date, projects(name)')
      .eq('client_id', params.id as string)
      .order('created_at', { ascending: false });

    if (invoicesData) setInvoices(invoicesData as Invoice[]);

    const { data: filesData } = await supabase
      .from('files')
      .select('file_name, storage_path, created_at')
      .eq('client_id', params.id as string)
      .order('created_at', { ascending: false });

    if (filesData) setUploadedFiles(filesData);

    const typedProjects = (projectsData || []) as Project[];
    if (typedProjects.length > 0) {
      const projectIds = typedProjects.map((p) => p.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, message_text, created_at, sender_id, is_internal, profiles(full_name, role)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(5);
      if (messagesData) setMessages(messagesData as any);
    }

    const { data: clientProfile } = await (supabase as any)
      .from('profiles')
      .select('id, email')
      .eq('client_id', params.id as string)
      .eq('role', 'client')
      .maybeSingle();

    if (clientProfile) {
      setClientHasAccount(true);
      setClientAccountEmail(clientProfile.email);
      try {
        const res = await fetch('/api/check-user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: clientProfile.email }),
        });
        const json = await res.json();
        if (json.active) setClientAccountActive(true);
      } catch (e) {
        console.error(e);
      }
    }

    setLoading(false);
  };

  const createClientAccount = async () => {
    if (!confirm(`Create a portal account for ${client?.contact_person}? They will receive an email invitation.`)) return;
    setCreatingAccount(true);
    try {
      const res = await fetch('/api/create-client-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.id as string,
          email: client?.contact_email,
          fullName: client?.contact_person,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      if (result.invitationLink) setInvitationLink(result.invitationLink);
      alert(result.emailSent ? `Account created! Email sent to ${client?.contact_email}` : `Account created. Invitation link: ${result.invitationLink || 'check below'}`);
      setClientHasAccount(true);
      await loadData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setCreatingAccount(false);
  };

  const resendInvitation = async () => {
    setResendingInvite(true);
    try {
      const res = await fetch('/api/resend-client-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clientAccountEmail }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      if (result.invitationLink) setInvitationLink(result.invitationLink);
      alert('Invitation resent.');
    } catch (err: any) {
      alert('Failed: ' + (err as Error).message);
    }
    setResendingInvite(false);
  };

  const toggleClientStatus = async () => {
    if (!client) return;
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`${newStatus === 'inactive' ? 'Retire' : 'Reactivate'} ${client.company_name}?`)) return;
    try {
      const { error } = await (supabase as any).from('clients').update({ status: newStatus }).eq('id', params.id as string);
      if (error) throw error;
      await loadData();
      alert(`Client ${newStatus}d.`);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const openEdit = () => {
    if (client) {
      setEditForm({
        company_name: client.company_name,
        contact_person: client.contact_person,
        contact_email: client.contact_email,
        contact_phone: client.contact_phone ?? '',
        industry: client.industry ?? '',
        website: client.website ?? '',
        status: client.status,
        priority_level: client.priority_level ?? '',
        expected_timeline: client.expected_timeline ?? '',
        address_street: client.address_street ?? '',
        address_city: client.address_city ?? '',
        address_postal_code: client.address_postal_code ?? '',
        address_country: client.address_country ?? 'Netherlands',
        vat_number: client.vat_number ?? '',
        kvk_number: client.kvk_number ?? '',
      });
      setEditOpen(true);
    }
  };

  const updateClient = async () => {
    if (!client) return;
    const payload = {
      company_name: editForm.company_name || client.company_name,
      contact_person: editForm.contact_person || client.contact_person,
      contact_email: editForm.contact_email || client.contact_email,
      contact_phone: editForm.contact_phone || null,
      industry: editForm.industry || null,
      website: editForm.website || null,
      status: editForm.status || client.status,
      priority_level: editForm.priority_level || null,
      expected_timeline: editForm.expected_timeline || null,
      address_street: editForm.address_street || null,
      address_city: editForm.address_city || null,
      address_postal_code: editForm.address_postal_code || null,
      address_country: editForm.address_country || null,
      vat_number: editForm.vat_number || null,
      kvk_number: editForm.kvk_number || null,
    };
    setEditSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('clients')
        .update(payload)
        .eq('id', params.id as string);
      if (error) throw error;
      setClient({ ...client, ...payload });
      setEditOpen(false);
      await loadData();
    } catch (err: unknown) {
      alert('Failed to update: ' + (err as Error).message);
    }
    setEditSaving(false);
  };

  const deleteClient = async () => {
    if (!client) return;
    if (!confirm(`DELETE ${client.company_name}? This cannot be undone.`)) return;
    const input = prompt(`Type "${client.company_name}" to confirm:`);
    if (input !== client.company_name) {
      alert('Cancelled.');
      return;
    }
    try {
      const { error } = await (supabase as any).from('clients').delete().eq('id', params.id as string);
      if (error) throw error;
      alert('Client deleted.');
      router.push('/dashboard/clients');
    } catch (err: any) {
      alert('Failed: ' + (err as Error).message);
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

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Client not found</h1>
          <Link href="/dashboard/clients" className="text-signal-red font-medium hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const paidRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const hasAddress = client.address_street || client.address_city || client.vat_number || client.kvk_number;

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/dashboard/clients"
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Back to clients"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{client.company_name}</h1>
                <p className="text-white/50 text-sm mt-0.5">
                  {client.contact_person} · {client.contact_email}
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                client.status === 'active' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-slate-500/20 text-slate-200'
              }`}>
                {client.status}
              </span>
              {client.priority_level && (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  client.priority_level === 'critical' ? 'bg-red-500/20 text-red-200' :
                  client.priority_level === 'high' ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-500/20 text-slate-200'
                }`}>
                  {client.priority_level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/dashboard/clients/${client.id}/projects/new`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                New Project
              </Link>
              <Link
                href={`/dashboard/clients/${client.id}/invoices/new`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors border border-white/10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                New Invoice
              </Link>
              <button
                onClick={toggleClientStatus}
                className="px-4 py-2.5 text-white/80 hover:text-white text-sm font-medium"
              >
                {client.status === 'active' ? 'Retire' : 'Reactivate'}
              </button>
              <button
                onClick={deleteClient}
                className="px-4 py-2.5 text-red-300 hover:text-red-200 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
          >
            <div className="flex flex-wrap items-center gap-8">
              <Link href={`/dashboard/projects?client=${client.id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-signal-red/10 flex items-center justify-center transition-colors">
                  <span className="text-xl font-bold text-navy-900 group-hover:text-signal-red">{projects.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Projects</p>
                  <p className="text-xs text-slate-500">{projects.filter((p) => ['in_progress', 'planning', 'review'].includes(p.status)).length} active</p>
                </div>
              </Link>
              <Link href={`/dashboard/invoices?client=${client.id}`} className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-signal-red/10 flex items-center justify-center transition-colors">
                  <span className="text-xl font-bold text-navy-900 group-hover:text-signal-red">{invoices.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Invoices</p>
                  <p className="text-xs text-slate-500">{pendingInvoices.length} pending · {overdueInvoices.length} overdue</p>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-emerald-700">€{paidRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Revenue</p>
                  <p className="text-xs text-slate-500">from this client</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-navy-900">{uploadedFiles.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Files</p>
                  <p className="text-xs text-slate-500">documents</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Projects, Invoices, Messages, Files */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoices — new section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoices</h2>
                  <Link href={`/dashboard/invoices?client=${client.id}`} className="text-sm font-medium text-signal-red hover:underline">All</Link>
                </div>
                {invoices.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-slate-600 font-medium mb-2">No invoices yet</p>
                    <p className="text-sm text-slate-500 mb-4">Create an invoice when you have billable work</p>
                    <Link href={`/dashboard/clients/${client.id}/invoices/new`} className="inline-flex items-center gap-2 text-signal-red font-medium hover:underline">
                      New invoice →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/dashboard/invoices?client=${client.id}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-signal-red/20 hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-navy-900">{inv.invoice_number}</p>
                          <p className="text-sm text-slate-500">{inv.projects?.name || '—'} · due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy-900">€{inv.amount.toLocaleString()}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {invoices.length > 5 && (
                      <Link href={`/dashboard/invoices?client=${client.id}`} className="block text-center py-2 text-sm font-medium text-signal-red hover:underline">
                        View all {invoices.length} invoices →
                      </Link>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Projects */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Projects</h2>
                  <Link href={`/dashboard/clients/${client.id}/projects/new`} className="text-sm font-medium text-signal-red hover:underline">New</Link>
                </div>
                {projects.length === 0 ? (
                  <div className="py-8 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-slate-600 font-medium mb-2">No projects yet</p>
                    <p className="text-sm text-slate-500 mb-4">Projects are how work and revenue get tracked</p>
                    <Link href={`/dashboard/clients/${client.id}/projects/new`} className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90">
                      New project
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/projects/${p.id}/milestones`}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-signal-red/20 hover:bg-slate-50 transition-colors group"
                      >
                        <p className="font-semibold text-navy-900 group-hover:text-signal-red">{p.name}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            p.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>{p.status.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2 w-24">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-signal-red rounded-full" style={{ width: `${p.progress_percentage ?? 0}%` }} />
                            </div>
                            <span className="text-xs font-bold">{p.progress_percentage ?? 0}%</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {projects.length > 4 && (
                      <Link href={`/dashboard/projects?client=${client.id}`} className="block text-center py-2 text-sm font-medium text-signal-red hover:underline">
                        View all {projects.length} projects →
                      </Link>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Messages */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent messages</h2>
                  {projects[0] && (
                    <Link href={`/dashboard/projects/${projects[0].id}/messages`} className="text-sm font-medium text-signal-red hover:underline">View</Link>
                  )}
                </div>
                {projects.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">Create a project to start messaging</div>
                ) : messages.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 mb-4">No messages yet</p>
                    <Link href={`/dashboard/projects/${projects[0].id}/messages`} className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90">
                      Start conversation
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`p-4 rounded-xl ${m.is_internal ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-navy-900">{m.profiles?.full_name}</span>
                          {m.is_internal && <span className="text-[10px] font-bold text-amber-700 px-2 py-0.5 bg-amber-200 rounded">INTERNAL</span>}
                          <span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{m.message_text}</p>
                      </div>
                    ))}
                    <Link href={`/dashboard/projects/${projects[0].id}/messages`} className="block text-center py-2 text-sm font-medium text-signal-red hover:underline">
                      View all →
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Documents */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents</h2>
                  <Link href={`/dashboard/clients/${client.id}/files`} className="text-sm font-medium text-signal-red hover:underline">View</Link>
                </div>
                {uploadedFiles.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm">No documents uploaded yet</div>
                ) : (
                  <div className="space-y-2">
                    {uploadedFiles.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-navy-900 truncate">{f.file_name}</p>
                        <span className="text-xs text-slate-500 ml-auto">{new Date(f.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Portal Access */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 sticky top-6"
              >
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Portal access</h3>
                {clientHasAccount ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-50">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full mb-2 ${
                        clientAccountActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {clientAccountActive ? 'Active' : 'Pending'}
                      </span>
                      <p className="text-sm text-navy-900">{clientAccountEmail}</p>
                    </div>
                    {!clientAccountActive && (
                      <button
                        onClick={resendInvitation}
                        disabled={resendingInvite}
                        className="w-full py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50"
                      >
                        {resendingInvite ? 'Sending...' : 'Resend invitation'}
                      </button>
                    )}
                    {invitationLink && (
                      <div className="flex gap-2">
                        <input readOnly value={invitationLink} className="flex-1 px-2 py-1.5 text-xs bg-slate-100 rounded-lg font-mono" />
                        <button
                          onClick={() => { navigator.clipboard.writeText(invitationLink); alert('Copied'); }}
                          className="px-3 py-1.5 bg-signal-red text-white text-xs font-semibold rounded-lg"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">No portal account. Create one to give them access.</p>
                    <button
                      onClick={createClientAccount}
                      disabled={creatingAccount}
                      className="w-full py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50"
                    >
                      {creatingAccount ? 'Creating...' : 'Create portal account'}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Contact & address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</h3>
                  <button
                    onClick={openEdit}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Person</p>
                    <p className="font-medium text-navy-900">{client.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Email</p>
                    <a href={`mailto:${client.contact_email}`} className="font-medium text-signal-red hover:underline">{client.contact_email}</a>
                  </div>
                  {client.contact_phone && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Phone</p>
                      <a href={`tel:${client.contact_phone}`} className="font-medium text-navy-900">{client.contact_phone}</a>
                    </div>
                  )}
                  {client.website && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Website</p>
                      <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-signal-red hover:underline truncate block">
                        {client.website}
                      </a>
                    </div>
                  )}
                  {client.industry && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Industry</p>
                      <p className="font-medium text-navy-900">{client.industry}</p>
                    </div>
                  )}
                  {hasAddress && (
                    <>
                      {client.address_street && (
                        <div>
                          <p className="text-slate-500 text-xs mb-0.5">Address</p>
                          <p className="font-medium text-navy-900">
                            {client.address_street}
                            {client.address_postal_code && client.address_city && `, ${client.address_postal_code} ${client.address_city}`}
                            {client.address_country && `, ${client.address_country}`}
                          </p>
                        </div>
                      )}
                      {client.vat_number && (
                        <div>
                          <p className="text-slate-500 text-xs mb-0.5">VAT</p>
                          <p className="font-medium text-navy-900 font-mono">{client.vat_number}</p>
                        </div>
                      )}
                      {client.kvk_number && (
                        <div>
                          <p className="text-slate-500 text-xs mb-0.5">KVK</p>
                          <p className="font-medium text-navy-900 font-mono">{client.kvk_number}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Client since</p>
                    <p className="font-medium text-navy-900">{new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </motion.div>

              {/* Onboarding (if present) */}
              {onboardingData && client.onboarding_status && client.onboarding_status !== 'not_started' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80"
                >
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Onboarding</h3>
                  {client.estimated_scope && (
                    <div className="mb-4 p-4 rounded-xl bg-slate-50 border-l-4 border-signal-red">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Scope</p>
                      <p className="text-sm text-navy-900">{client.estimated_scope}</p>
                    </div>
                  )}
                  {onboardingData.service_categories?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {onboardingData.service_categories.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-signal-red/10 text-signal-red text-xs font-semibold rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(projectLead || technicalLead) && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {projectLead && <div><p className="text-slate-500 text-xs">Project lead</p><p className="font-medium">{projectLead}</p></div>}
                      {technicalLead && <div><p className="text-slate-500 text-xs">Tech lead</p><p className="font-medium">{technicalLead}</p></div>}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit client modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setEditOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-client-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 id="edit-client-title" className="text-xl font-bold text-navy-900">Edit client</h2>
              <p className="text-sm text-slate-500 mt-0.5">{client.company_name}</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); updateClient(); }}
              className="p-6 space-y-6"
            >
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Company</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Company name</label>
                    <input
                      type="text"
                      required
                      value={editForm.company_name ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, company_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Industry</label>
                    <input
                      type="text"
                      value={editForm.industry ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, industry: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Contact</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Contact person</label>
                    <input
                      type="text"
                      required
                      value={editForm.contact_person ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_person: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={editForm.contact_email ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.contact_phone ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
                    <input
                      type="url"
                      placeholder="https://"
                      value={editForm.website ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Street</label>
                    <input
                      type="text"
                      value={editForm.address_street ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, address_street: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Postal code</label>
                      <input
                        type="text"
                        value={editForm.address_postal_code ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, address_postal_code: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.address_city ?? ''}
                        onChange={(e) => setEditForm((f) => ({ ...f, address_city: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={editForm.address_country ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, address_country: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Business details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">VAT number</label>
                    <input
                      type="text"
                      value={editForm.vat_number ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, vat_number: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">KVK number</label>
                    <input
                      type="text"
                      value={editForm.kvk_number ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, kvk_number: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Status</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={(editForm.status ?? client.status) === 'active'}
                      onChange={() => setEditForm((f) => ({ ...f, status: 'active' }))}
                      className="text-signal-red focus:ring-signal-red"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={(editForm.status ?? client.status) === 'inactive'}
                      onChange={() => setEditForm((f) => ({ ...f, status: 'inactive' }))}
                      className="text-signal-red focus:ring-signal-red"
                    />
                    <span className="text-sm">Inactive</span>
                  </label>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                  <select
                    value={editForm.priority_level ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, priority_level: e.target.value || null }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  >
                    <option value="">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Expected timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. Q1 2025"
                    value={editForm.expected_timeline ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, expected_timeline: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50 transition-colors"
                >
                  {editSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
