'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  status: string;
  onboarding_notes: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  vat_number: string | null;
  kvk_number: string | null;
  customer_number: string | null;
  created_at: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress_percentage: number;
  created_at: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  description: string | null;
};

type InternalNote = {
  id: string;
  note_text: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
};

export default function ClientDetailPage() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [clientHasAccount, setClientHasAccount] = useState(false);
  const [clientAccountEmail, setClientAccountEmail] = useState('');
  const [clientAccountActive, setClientAccountActive] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Load client
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error loading client:', error);
      } else {
        setClient(data);
      }

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (projectsData) {
        setProjects(projectsData);
      }

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', params.id)
        .order('issue_date', { ascending: false });

      if (invoicesData) {
        setInvoices(invoicesData);
      }

      // Load internal notes
      const { data: notesData } = await supabase
        .from('internal_notes')
        .select('*, profiles(full_name)')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (notesData) {
        setInternalNotes(notesData as any);
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

  useEffect(() => {
    loadData();
  }, [params.id]);

  const toggleClientStatus = async () => {
    if (!client) return;
    
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await (supabase as any)
        .from('clients')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const deleteClient = async () => {
    if (!client) return;

    const confirmDelete = confirm(
      `⚠️ Delete ${client.company_name}?\n\n` +
      `This will permanently delete:\n` +
      `• Client record\n` +
      `• All projects\n` +
      `• All milestones\n` +
      `• All invoices\n` +
      `• All files\n` +
      `• All messages\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await (supabase as any)
        .from('clients')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      alert(`${client.company_name} has been deleted.`);
      router.push('/dashboard/clients');
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client: ' + err.message);
    }
  };

  const startEditing = () => {
    setEditForm({
      company_name: client?.company_name || '',
      contact_person: client?.contact_person || '',
      contact_email: client?.contact_email || '',
      contact_phone: client?.contact_phone || '',
      industry: client?.industry || '',
      onboarding_notes: client?.onboarding_notes || '',
      address_street: client?.address_street || '',
      address_city: client?.address_city || '',
      address_postal_code: client?.address_postal_code || '',
      address_country: client?.address_country || 'Netherlands',
      vat_number: client?.vat_number || '',
      kvk_number: client?.kvk_number || '',
      customer_number: client?.customer_number || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveChanges = async () => {
    setSaveLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('clients')
        .update({
          company_name: editForm.company_name,
          contact_person: editForm.contact_person,
          contact_email: editForm.contact_email,
          contact_phone: editForm.contact_phone || null,
          industry: editForm.industry || null,
          onboarding_notes: editForm.onboarding_notes || null,
          address_street: editForm.address_street || null,
          address_city: editForm.address_city || null,
          address_postal_code: editForm.address_postal_code || null,
          address_country: editForm.address_country || 'Netherlands',
          vat_number: editForm.vat_number || null,
          kvk_number: editForm.kvk_number || null,
          customer_number: editForm.customer_number || null,
        })
        .eq('id', params.id);

      if (error) throw error;

      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) setClient(data);
      setIsEditing(false);
      alert('✅ Client information updated successfully!');
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Failed to save changes: ' + err.message);
    }
    setSaveLoading(false);
  };

  const markInvoiceAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', invoiceId);

      if (error) throw error;

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', params.id)
        .order('issue_date', { ascending: false });

      if (invoicesData) setInvoices(invoicesData);
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      alert('Failed to update: ' + err.message);
    }
  };

  const addInternalNote = async () => {
    if (!newNote.trim()) return;
    
    setAddingNote(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await (supabase as any)
        .from('internal_notes')
        .insert({
          client_id: params.id as string,
          note_text: newNote.trim(),
          created_by: session.user.id,
        });

      if (error) throw error;

      const { data: notesData } = await supabase
        .from('internal_notes')
        .select('*, profiles(full_name)')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (notesData) {
        setInternalNotes(notesData as any);
      }

      setNewNote('');
    } catch (err: any) {
      console.error('Error adding note:', err);
      alert('Failed to add note: ' + err.message);
    }
    setAddingNote(false);
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

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'projects', label: 'Projects', icon: 'projects', count: projects.length },
    { id: 'invoices', label: 'Invoices', icon: 'invoices', count: invoices.length },
    { id: 'files', label: 'Files', icon: 'files' },
    { id: 'notes', label: 'Internal Notes', icon: 'notes', count: internalNotes.length },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Clients
        </Link>
      </div>

      {/* Client Header Card */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold">{client.company_name}</h1>
              <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                client.status === 'active' 
                  ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                  : 'bg-gray-500/20 text-gray-200 border border-gray-400/30'
              }`}>
                {client.status === 'active' ? '✓ Active' : '○ Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-6 text-white/90">
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
              {client.contact_phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{client.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleClientStatus}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/20"
            >
              {client.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={deleteClient}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sticky top-24">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1 ${
                  activeSection === item.id
                    ? 'bg-signal-red text-white shadow-md'
                    : 'text-slate-700 hover:bg-off-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon === 'overview' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {item.icon === 'projects' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                  {item.icon === 'invoices' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {item.icon === 'files' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {item.icon === 'notes' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    activeSection === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Projects</p>
                      <p className="text-3xl font-bold text-navy-900">{projects.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-off-white rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Invoices</p>
                      <p className="text-3xl font-bold text-navy-900">{invoices.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-off-white rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Client Since</p>
                      <p className="text-lg font-bold text-navy-900">
                        {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-off-white rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link 
                    href={`/dashboard/clients/${client.id}/projects/new`}
                    className="p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="font-bold text-navy-900">Create Project</p>
                    </div>
                    <p className="text-sm text-slate-700">Start a new project</p>
                  </Link>
                  <Link 
                    href={`/dashboard/clients/${client.id}/invoices/new`}
                    className="p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-bold text-navy-900">New Invoice</p>
                    </div>
                    <p className="text-sm text-slate-700">Generate invoice</p>
                  </Link>
                  <Link 
                    href={`/dashboard/clients/${client.id}/files`}
                    className="p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center group-hover:bg-signal-red transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="font-bold text-navy-900">Upload Files</p>
                    </div>
                    <p className="text-sm text-slate-700">Share documents</p>
                  </Link>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy-900">Client Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy-900 text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy-900 text-sm font-semibold rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-colors duration-200 disabled:opacity-50"
                      >
                        {saveLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={editForm.company_name}
                          onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Contact Person</label>
                        <input
                          type="text"
                          value={editForm.contact_person}
                          onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.contact_email}
                          onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={editForm.contact_phone}
                          onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Industry</label>
                      <input
                        type="text"
                        value={editForm.industry}
                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Billing Address</label>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editForm.address_street}
                          onChange={(e) => setEditForm({ ...editForm, address_street: e.target.value })}
                          placeholder="Street address"
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editForm.address_postal_code}
                            onChange={(e) => setEditForm({ ...editForm, address_postal_code: e.target.value })}
                            placeholder="Postal code"
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                          />
                          <input
                            type="text"
                            value={editForm.address_city}
                            onChange={(e) => setEditForm({ ...editForm, address_city: e.target.value })}
                            placeholder="City"
                            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                          />
                        </div>
                        <input
                          type="text"
                          value={editForm.address_country}
                          onChange={(e) => setEditForm({ ...editForm, address_country: e.target.value })}
                          placeholder="Country"
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">VAT Number</label>
                        <input
                          type="text"
                          value={editForm.vat_number}
                          onChange={(e) => setEditForm({ ...editForm, vat_number: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">KVK Number</label>
                        <input
                          type="text"
                          value={editForm.kvk_number}
                          onChange={(e) => setEditForm({ ...editForm, kvk_number: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Customer Number</label>
                      <input
                        type="text"
                        value={editForm.customer_number}
                        onChange={(e) => setEditForm({ ...editForm, customer_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Onboarding Notes</label>
                      <textarea
                        rows={4}
                        value={editForm.onboarding_notes}
                        onChange={(e) => setEditForm({ ...editForm, onboarding_notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Company</p>
                        <p className="font-semibold text-navy-900">{client.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Industry</p>
                        <p className="font-semibold text-navy-900">{client.industry || '—'}</p>
                      </div>
                      {(client.address_street || client.address_city) && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Billing Address</p>
                          <p className="font-semibold text-navy-900">
                            {client.address_street && <>{client.address_street}<br /></>}
                            {client.address_postal_code} {client.address_city}
                            {client.address_country && <><br />{client.address_country}</>}
                          </p>
                        </div>
                      )}
                      {(client.vat_number || client.kvk_number) && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Legal Info</p>
                          <p className="font-semibold text-navy-900">
                            {client.vat_number && <>VAT: {client.vat_number}<br /></>}
                            {client.kvk_number && <>KVK: {client.kvk_number}</>}
                          </p>
                        </div>
                      )}
                    </div>
                    {client.customer_number && (
                      <div className="p-4 bg-off-white rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Customer Number</p>
                        <p className="font-bold text-lg text-navy-900">{client.customer_number}</p>
                      </div>
                    )}
                    {client.onboarding_notes && (
                      <div className="p-4 bg-off-white border-l-4 border-signal-red rounded-lg">
                        <p className="text-sm font-semibold text-navy-900 mb-2">Onboarding Notes</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{client.onboarding_notes}</p>
                      </div>
                    )}
                    {(!client.address_street || !client.vat_number) && (
                      <div className="p-4 bg-off-white border-l-4 border-signal-red rounded-lg">
                        <p className="text-sm font-semibold text-navy-900 mb-2">Missing Information</p>
                        <p className="text-sm text-slate-700">
                          Missing: {!client.address_street && 'Billing address'} {!client.address_street && !client.vat_number && '• '} {!client.vat_number && 'VAT number'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Portal Access */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-navy-900 mb-4">Client Portal Access</h2>
                {clientHasAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-off-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          clientAccountActive 
                            ? 'bg-off-white text-navy-900 border border-gray-300' 
                            : 'bg-off-white text-slate-700 border border-gray-300'
                        }`}>
                          {clientAccountActive ? 'Active' : 'Pending'}
                        </span>
                        <span className="text-slate-700">{clientAccountEmail}</span>
                      </div>
                      <button
                        onClick={resendInvitation}
                        disabled={resendingInvite}
                        className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200 disabled:opacity-50"
                      >
                        {resendingInvite ? 'Sending...' : 'Resend Invitation'}
                      </button>
                    </div>
                    {invitationLink && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-navy-900 mb-2">Invitation Link</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={invitationLink}
                            readOnly
                            className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(invitationLink);
                              alert('Link copied!');
                            }}
                            className="px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-off-white rounded-lg">
                    <p className="text-slate-700 mb-4">No portal account yet.</p>
                    <button
                      onClick={createClientAccount}
                      disabled={creatingAccount}
                      className="px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50"
                    >
                      {creatingAccount ? 'Creating...' : 'Create Portal Account'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy-900">Projects</h2>
                <Link
                  href={`/dashboard/clients/${client.id}/projects/new`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-slate-700 mb-4">No projects yet.</p>
                  <Link
                    href={`/dashboard/clients/${client.id}/projects/new`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90"
                  >
                    Create First Project
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-navy-900 mb-2">{project.name}</h3>
                          {project.description && (
                            <p className="text-slate-700 mb-3">{project.description}</p>
                          )}
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-slate-600">
                              Created {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Link
                            href={`/dashboard/projects/${project.id}/milestones`}
                            className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
                          >
                            Milestones
                          </Link>
                          <span className="text-slate-300">|</span>
                          <Link
                            href={`/dashboard/projects/${project.id}/messages`}
                            className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
                          >
                            Messages
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-signal-red h-full transition-all duration-500" 
                            style={{ width: `${project.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-navy-900 min-w-[48px]">
                          {project.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy-900">Invoices</h2>
                <Link
                  href={`/dashboard/clients/${client.id}/invoices/new`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Invoice
                </Link>
              </div>

              {invoices.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-slate-700 mb-4">No invoices yet.</p>
                  <Link
                    href={`/dashboard/clients/${client.id}/invoices/new`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90"
                  >
                    Create First Invoice
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-bold text-navy-900">{invoice.invoice_number}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status.toUpperCase()}
                            </span>
                          </div>
                          {invoice.description && (
                            <p className="text-slate-700 mb-3">{invoice.description}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                            <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                            {invoice.paid_date && (
                              <span className="text-green-700 font-semibold">
                                Paid: {new Date(invoice.paid_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-navy-900 mb-3">
                            €{invoice.amount.toFixed(2)}
                          </p>
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => markInvoiceAsPaid(invoice.id)}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'files' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Files</h2>
              <Link
                href={`/dashboard/clients/${client.id}/files`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200"
              >
                Manage Files
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}

          {activeSection === 'notes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Internal Notes</h2>
                <p className="text-sm text-slate-700 p-4 bg-off-white border-l-4 border-signal-red rounded-lg">
                  <strong>Private:</strong> These notes are only visible to IE Global team members.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-navy-900 mb-4">Add New Note</h3>
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a private note about this client..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg resize-none"
                  />
                  <button
                    onClick={addInternalNote}
                    disabled={addingNote || !newNote.trim()}
                    className="px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {internalNotes.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-slate-700">No internal notes yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internalNotes.map((note) => (
                    <div key={note.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-signal-red">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-navy-900">
                            {note.profiles?.full_name || 'Team Member'}
                          </span>
                          <span className="px-2 py-1 bg-off-white text-slate-700 border border-gray-300 text-xs font-semibold rounded-full">
                            INTERNAL
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
