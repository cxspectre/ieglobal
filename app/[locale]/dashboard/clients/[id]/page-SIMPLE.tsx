'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
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
  profiles: {
    full_name: string;
    role: string;
  };
};

export default function ClientDetailPageRedesign() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectLead, setProjectLead] = useState<string>('');
  const [technicalLead, setTechnicalLead] = useState<string>('');
  const [clientHasAccount, setClientHasAccount] = useState(false);
  const [clientAccountEmail, setClientAccountEmail] = useState('');
  const [clientAccountActive, setClientAccountActive] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Load client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single();

    if (clientData) setClient(clientData);

    // Load onboarding data
    const { data: onboarding } = await (supabase as any)
      .from('client_onboarding_data')
      .select('*')
      .eq('client_id', params.id)
      .single();

    if (onboarding) {
      setOnboardingData(onboarding);

      // Load team member names
      if (onboarding.project_lead_id) {
        const { data: lead } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', onboarding.project_lead_id)
          .single();
        if (lead) setProjectLead((lead as { full_name: string }).full_name);
      }

      if (onboarding.technical_lead_id) {
        const { data: tech } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', onboarding.technical_lead_id)
          .single();
        if (tech) setTechnicalLead((tech as { full_name: string }).full_name);
      }
    }

    // Load projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, status, progress_percentage')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false });

    if (projectsData) setProjects(projectsData as Project[]);

    // Load uploaded files
    const { data: filesData } = await supabase
      .from('files')
      .select('file_name, storage_path, created_at')
      .eq('client_id', params.id)
      .order('created_at', { ascending: false });

    if (filesData) setUploadedFiles(filesData);

    // Load recent messages from all client projects
    const typedProjectsData = projectsData as Project[] | null;
    if (typedProjectsData && typedProjectsData.length > 0) {
      const projectIds = typedProjectsData.map(p => p.id);
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, message_text, created_at, sender_id, is_internal, profiles(full_name, role)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesData) setMessages(messagesData as any);
    }

    // Check if client has a user account
    const { data: clientProfile } = await (supabase as any)
      .from('profiles')
      .select('id, email')
      .eq('client_id', params.id)
      .eq('role', 'client')
      .maybeSingle();

    if (clientProfile) {
      setClientHasAccount(true);
      setClientAccountEmail(clientProfile.email);

      try {
        const statusResponse = await fetch('/api/check-user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: clientProfile.email }),
        });

        const statusResult = await statusResponse.json();
        if (statusResult.active) {
          setClientAccountActive(true);
        }
      } catch (err) {
        console.error('Failed to check user status:', err);
      }
    }

    setLoading(false);
  };

  const createClientAccount = async () => {
    if (!confirm(`Create a portal account for ${client?.contact_person}? They will receive an email invitation to set their password.`)) {
      return;
    }

    setCreatingAccount(true);
    try {
      const response = await fetch('/api/create-client-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: params.id,
          email: client?.contact_email,
          fullName: client?.contact_person,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      if (result.invitationLink) {
        setInvitationLink(result.invitationLink);
        
        const message = result.emailSent
          ? `✅ Account created! Invitation email sent to ${client?.contact_email}\n\nBackup: The invitation link is shown below if needed.`
          : `⚠️ Account created but email may not have sent.\n\nPlease copy the invitation link below and share it with ${client?.contact_person} directly.`;
        
        alert(message);
      } else {
        alert(`Account created for ${client?.contact_email}`);
      }
      
      setClientHasAccount(true);
      await loadData();
    } catch (err: any) {
      console.error('Error creating account:', err);
      alert('Failed to create account: ' + err.message);
    }
    setCreatingAccount(false);
  };

  const resendInvitation = async () => {
    setResendingInvite(true);
    try {
      const response = await fetch('/api/resend-client-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clientAccountEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend invitation');
      }

      if (result.invitationLink) {
        setInvitationLink(result.invitationLink);
        alert('New invitation link generated! Copy it from below.');
      } else {
        alert(`Invitation resent to ${clientAccountEmail}`);
      }
    } catch (err: any) {
      console.error('Error resending invitation:', err);
      alert('Failed to resend: ' + err.message);
    }
    setResendingInvite(false);
  };

  const toggleClientStatus = async () => {
    if (!client) return;
    
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'retire' : 'reactivate';
    
    if (!confirm(`${action === 'retire' ? '⚠️' : '✓'} ${action.charAt(0).toUpperCase() + action.slice(1)} ${client.company_name}?`)) {
      return;
    }
    
    try {
      const { error } = await (supabase as any)
        .from('clients')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;
      await loadData();
      alert(`✅ Client ${action}d successfully`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const deleteClient = async () => {
    if (!client) return;

    const confirmDelete = confirm(
      `⚠️ DELETE ${client.company_name}?\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• Client record\n` +
      `• All projects\n` +
      `• All milestones\n` +
      `• All invoices\n` +
      `• All files\n` +
      `• All messages\n\n` +
      `⚠️ THIS ACTION CANNOT BE UNDONE.\n\n` +
      `Type the company name to confirm.`
    );

    if (!confirmDelete) return;

    const userInput = prompt(`Type "${client.company_name}" to confirm deletion:`);
    
    if (userInput !== client.company_name) {
      alert('❌ Deletion cancelled - company name did not match.');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('clients')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      alert(`✅ ${client.company_name} has been permanently deleted.`);
      router.push('/dashboard/clients');
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Client Not Found</h1>
          <Link href="/dashboard/clients" className="text-signal-red hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-slate-100 text-slate-800 border-slate-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Clients
      </Link>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl p-8 mb-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl font-bold text-white">{client.company_name}</h1>
              <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                client.status === 'active'
                  ? 'bg-green-500/20 text-green-200 border border-green-400/30'
                  : 'bg-gray-500/20 text-gray-200 border border-gray-400/30'
              }`}>
                {client.status === 'active' ? '✓ Active' : '○ Inactive'}
              </span>
              {client.priority_level && (
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize border ${
                  client.priority_level === 'critical' ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                  client.priority_level === 'high' ? 'bg-orange-500/20 text-orange-200 border-orange-400/30' :
                  client.priority_level === 'medium' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                  'bg-gray-500/20 text-gray-200 border-gray-400/30'
                }`}>
                  {client.priority_level} Priority
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{client.contact_person}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${client.contact_email}`} className="hover:text-white underline">
                  {client.contact_email}
                </a>
              </div>
              {client.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">
                    {client.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/clients/${client.id}/projects/new`}
              className="px-4 py-2 bg-signal-red hover:bg-signal-red/90 text-white text-sm font-semibold rounded-lg transition-all duration-200"
            >
              + New Project
            </Link>
            <Link
              href={`/dashboard/clients/${client.id}/invoices/new`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/20"
            >
              + New Invoice
            </Link>
            <button
              onClick={toggleClientStatus}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/20"
            >
              {client.status === 'active' ? 'Retire' : 'Reactivate'}
            </button>
            <button
              onClick={deleteClient}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
      >
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Projects</span>
            <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-navy-900">{projects.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Messages</span>
            <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-navy-900">{messages.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Documents</span>
            <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-navy-900">{uploadedFiles.length}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Timeline</span>
            <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg font-bold text-navy-900">
            {client.expected_timeline || 'Not set'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Client Since</span>
            <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-lg font-bold text-navy-900">
            {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Onboarding Status */}
          {client.onboarding_status && client.onboarding_status !== 'not_started' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onboarding Information
              </h2>

              {client.estimated_scope && (
                <div className="mb-4 p-4 bg-off-white rounded-lg border-l-4 border-signal-red">
                  <p className="text-sm font-semibold text-navy-900 mb-1">Project Scope</p>
                  <p className="text-slate-700">{client.estimated_scope}</p>
                </div>
              )}

              {onboardingData?.service_categories && onboardingData.service_categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-navy-900 mb-2">Service Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.service_categories.map((service, idx) => (
                      <span key={idx} className="px-3 py-1 bg-signal-red/10 text-signal-red text-sm font-semibold rounded-full border border-signal-red/20">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {projectLead && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Project Lead</p>
                    <p className="font-semibold text-navy-900">{projectLead}</p>
                  </div>
                )}
                {technicalLead && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Technical Lead</p>
                    <p className="font-semibold text-navy-900">{technicalLead}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900">Active Projects</h2>
              <Link
                href={`/dashboard/clients/${client.id}/projects/new`}
                className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
              >
                + New Project
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p>No projects yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="p-4 bg-off-white rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-navy-900">{project.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-signal-red h-full transition-all duration-500"
                          style={{ width: `${project.progress_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-navy-900">
                        {project.progress_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {projects.length > 3 && (
                  <Link
                    href={`/dashboard/projects?client=${client.id}`}
                    className="block text-center py-2 text-sm font-semibold text-signal-red hover:text-signal-red/80"
                  >
                    View all {projects.length} projects →
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Recent Messages
              </h2>
              {projects.length > 0 && (
                <Link
                  href={`/dashboard/projects/${projects[0].id}/messages`}
                  className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
                >
                  View All →
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mb-3">Create a project first to start messaging</p>
                <Link
                  href={`/dashboard/clients/${client.id}/projects/new`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90"
                >
                  Create Project
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p className="mb-3">No messages yet</p>
                <Link
                  href={`/dashboard/projects/${projects[0].id}/messages`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90"
                >
                  Start Conversation
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`p-4 rounded-lg border ${
                    message.is_internal 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-off-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy-900">
                          {message.profiles?.full_name || 'Team Member'}
                        </span>
                        {message.is_internal && (
                          <span className="px-2 py-0.5 bg-orange-200 text-orange-900 text-xs font-bold rounded-full">
                            INTERNAL
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {message.message_text}
                    </p>
                  </div>
                ))}
                <Link
                  href={`/dashboard/projects/${projects[0].id}/messages`}
                  className="block text-center py-3 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-colors"
                >
                  View All Messages & Reply
                </Link>
              </div>
            )}
          </motion.div>

          {/* Uploaded Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-900">Uploaded Documents</h2>
              <Link
                href={`/upload/${client.id}`}
                className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
              >
                Upload Portal →
              </Link>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.slice(0, 5).map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-off-white rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{file.file_name}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {uploadedFiles.length > 5 && (
                  <p className="text-center text-sm text-slate-600 pt-2">
                    + {uploadedFiles.length - 5} more files
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Portal Access Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Portal Access
            </h3>
            
            {clientHasAccount ? (
              <div className="space-y-3">
                <div className="p-4 bg-off-white rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      clientAccountActive
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}>
                      {clientAccountActive ? '✓ ACTIVE' : '⋯ PENDING'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{clientAccountEmail}</p>
                </div>
                
                {!clientAccountActive && (
                  <button
                    onClick={resendInvitation}
                    disabled={resendingInvite}
                    className="w-full px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-colors disabled:opacity-50"
                  >
                    {resendingInvite ? 'Sending...' : 'Resend Invitation'}
                  </button>
                )}

                {invitationLink && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-navy-900 mb-2">Invitation Link</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={invitationLink}
                        readOnly
                        className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(invitationLink);
                          alert('Link copied!');
                        }}
                        className="px-3 py-1 bg-signal-red text-white text-xs font-semibold rounded hover:bg-signal-red/90"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-700 mb-3">No portal account yet. Create one to give them access to projects, files, and invoices.</p>
                <button
                  onClick={createClientAccount}
                  disabled={creatingAccount}
                  className="w-full px-4 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50"
                >
                  {creatingAccount ? 'Creating Account...' : 'Create Portal Account'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/clients/${client.id}/projects/new`}
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-navy-900">New Project</span>
              </Link>

              <Link
                href={`/dashboard/clients/${client.id}/invoices/new`}
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-semibold text-navy-900">New Invoice</span>
              </Link>

              <Link
                href={`/upload/${client.id}`}
                className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="font-semibold text-navy-900">Upload Portal</span>
              </Link>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Contact Person</p>
                <p className="font-semibold text-navy-900">{client.contact_person}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <a href={`mailto:${client.contact_email}`} className="font-semibold text-signal-red hover:underline">
                  {client.contact_email}
                </a>
              </div>
              {client.contact_phone && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phone</p>
                  <a href={`tel:${client.contact_phone}`} className="font-semibold text-navy-900">
                    {client.contact_phone}
                  </a>
                </div>
              )}
              {client.industry && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Industry</p>
                  <p className="font-semibold text-navy-900">{client.industry}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

