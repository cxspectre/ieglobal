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
  const [activeTab, setActiveTab] = useState('overview');
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

      console.log('Client profile check for client_id:', params.id, 'Found:', clientProfile);

      if (clientProfile) {
        setClientHasAccount(true);
        setClientAccountEmail(clientProfile.email);

        // Check if user is actually active (has logged in or confirmed email)
        try {
          const statusResponse = await fetch('/api/check-user-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: clientProfile.email }),
          });

          const statusResult = await statusResponse.json();
          console.log('User status check:', statusResult);

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

      // Reload client data
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
      // Delete client (CASCADE will handle all related records)
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
        })
        .eq('id', params.id);

      if (error) throw error;

      // Reload client data
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) setClient(data);
      setIsEditing(false);
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

      // Reload invoices
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

      // Reload notes
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

      console.log('Account creation result:', result);

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
      
      // Reload to show account status
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

          {/* Client Header */}
          <div className="bg-white p-8 mb-6 border-l-4 border-signal-red">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-navy-900 mb-2">{client.company_name}</h1>
                <p className="text-slate-700">{client.contact_person} • {client.contact_email}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleClientStatus}
                  className={`px-4 py-2 text-sm font-semibold transition-all duration-200 hover:opacity-80 ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {client.status === 'active' ? '✓ Active' : '○ Inactive'}
                </button>
                <button
                  onClick={deleteClient}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-slate-600 mb-1">Industry</p>
                <p className="font-semibold text-navy-900">{client.industry || '—'}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Phone</p>
                <p className="font-semibold text-navy-900">{client.contact_phone || '—'}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Client Since</p>
                <p className="font-semibold text-navy-900">
                  {new Date(client.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 mb-6">
            <div className="flex items-center gap-8 px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-signal-red text-navy-900'
                    : 'border-transparent text-slate-700 hover:text-navy-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'projects'
                    ? 'border-signal-red text-navy-900'
                    : 'border-transparent text-slate-700 hover:text-navy-900'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'invoices'
                    ? 'border-signal-red text-navy-900'
                    : 'border-transparent text-slate-700 hover:text-navy-900'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'files'
                    ? 'border-signal-red text-navy-900'
                    : 'border-transparent text-slate-700 hover:text-navy-900'
                }`}
              >
                Files
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'notes'
                    ? 'border-signal-red text-navy-900'
                    : 'border-transparent text-slate-700 hover:text-navy-900'
                }`}
              >
                Internal Notes
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-8">
            {activeTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Client Overview</h2>
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className="px-4 py-2 bg-gray-100 text-navy-900 text-sm font-semibold hover:bg-gray-200 transition-colors duration-200"
                    >
                      Edit Client
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-100 text-navy-900 text-sm font-semibold hover:bg-gray-200 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveChanges}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-colors duration-200 disabled:opacity-50"
                      >
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={editForm.contact_person}
                        onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={editForm.contact_email}
                        onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={editForm.contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Industry</label>
                      <input
                        type="text"
                        value={editForm.industry}
                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Onboarding Notes</label>
                      <textarea
                        rows={4}
                        value={editForm.onboarding_notes}
                        onChange={(e) => setEditForm({ ...editForm, onboarding_notes: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {client.onboarding_notes && (
                      <div className="mb-8 p-6 bg-off-white border-l-4 border-signal-red">
                        <h3 className="text-sm font-bold text-navy-900 mb-2">Onboarding Notes</h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{client.onboarding_notes}</p>
                      </div>
                    )}
                  </>
                )}

                {!isEditing && (
                  <div className="space-y-6">
                    {/* Client Portal Access */}
                    <div className="p-6 bg-off-white border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Client Portal Access</h3>
                      {clientHasAccount ? (
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold ${
                                clientAccountActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {clientAccountActive ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pending
                                  </>
                                )}
                              </span>
                              <span className="text-sm text-slate-700">
                                {clientAccountEmail}
                              </span>
                            </div>
                            <button
                              onClick={resendInvitation}
                              disabled={resendingInvite}
                              className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200 disabled:opacity-50"
                            >
                              {resendingInvite ? 'Sending...' : 'Resend Invitation'}
                            </button>
                          </div>
                          <p className="text-sm text-slate-700 mb-3">
                            {clientAccountActive ? (
                              <>
                                Status: <span className="font-semibold text-green-700">Account Active - Client can log in</span>
                              </>
                            ) : (
                              <>
                                Status: <span className="font-semibold text-yellow-700">Invitation Sent - Awaiting password setup</span>
                              </>
                            )}
                            {' • '}
                            <a href="/login" target="_blank" className="text-signal-red hover:underline font-semibold">
                              Portal Login
                            </a>
                          </p>
                          
                          {invitationLink && (
                            <div className="mt-4 p-4 bg-white border border-gray-200">
                              <p className="text-sm font-semibold text-navy-900 mb-2">Invitation Link (share manually if needed):</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={invitationLink}
                                  readOnly
                                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 font-mono"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(invitationLink);
                                    alert('Link copied to clipboard!');
                                  }}
                                  className="px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-colors duration-200"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-xs text-slate-600 mt-2">
                                ⚠️ Supabase emails may not send. Share this link directly with your client via email or message.
                              </p>
                            </div>
                          )}
                          
                          {!invitationLink && (
                            <p className="text-xs text-slate-600 mt-2">
                              If client hasn't received the email, click "Resend Invitation" to generate a new link
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-700 mb-4">
                            No portal account yet. Create one to give {client.contact_person} access to their project dashboard.
                          </p>
                          <button
                            onClick={createClientAccount}
                            disabled={creatingAccount}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>{creatingAccount ? 'Creating Account...' : 'Create Portal Account & Send Invitation'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href={`/dashboard/clients/${client.id}/projects/new`} className="p-4 bg-off-white hover:bg-gray-100 text-left transition-colors duration-200">
                        <p className="font-semibold text-navy-900 mb-1">Create Project</p>
                        <p className="text-sm text-slate-700">Add a new project for this client</p>
                      </Link>
                      <Link href={`/dashboard/clients/${client.id}/invoices/new`} className="p-4 bg-off-white hover:bg-gray-100 text-left transition-colors duration-200">
                        <p className="font-semibold text-navy-900 mb-1">Add Invoice</p>
                        <p className="text-sm text-slate-700">Create and send an invoice</p>
                      </Link>
                      <Link href={`/dashboard/clients/${client.id}/files`} className="p-4 bg-off-white hover:bg-gray-100 text-left transition-colors duration-200">
                        <p className="font-semibold text-navy-900 mb-1">Upload Files</p>
                        <p className="text-sm text-slate-700">Share documents with client</p>
                      </Link>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600">Company</p>
                        <p className="font-semibold text-navy-900">{client.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Contact Person</p>
                        <p className="font-semibold text-navy-900">{client.contact_person}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-navy-900">
                          <a href={`mailto:${client.contact_email}`} className="text-signal-red hover:underline">
                            {client.contact_email}
                          </a>
                        </p>
                      </div>
                      {client.contact_phone && (
                        <div>
                          <p className="text-sm text-slate-600">Phone</p>
                          <p className="font-semibold text-navy-900">{client.contact_phone}</p>
                        </div>
                      )}
                      {client.industry && (
                        <div>
                          <p className="text-sm text-slate-600">Industry</p>
                          <p className="font-semibold text-navy-900">{client.industry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Projects</h2>
                  <Link
                    href={`/dashboard/clients/${client.id}/projects/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Project</span>
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-off-white">
                    <p className="text-slate-700 mb-4">No projects yet.</p>
                    <Link
                      href={`/dashboard/clients/${client.id}/projects/new`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                    >
                      Create First Project
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="p-6 bg-off-white hover:bg-gray-50 transition-colors duration-200 border-l-4 border-signal-red">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-navy-900 mb-2">{project.name}</h3>
                            {project.description && (
                              <p className="text-slate-700 mb-3">{project.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-3 py-1 font-semibold ${
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status.replace('_', ' ')}
                              </span>
                              <span className="text-slate-600">
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

            {activeTab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Invoices</h2>
                  <Link
                    href={`/dashboard/clients/${client.id}/invoices/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Invoice</span>
                  </Link>
                </div>

                {invoices.length === 0 ? (
                  <div className="text-center py-12 bg-off-white">
                    <p className="text-slate-700 mb-4">No invoices yet.</p>
                    <Link
                      href={`/dashboard/clients/${client.id}/invoices/new`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                    >
                      Create First Invoice
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="p-6 bg-off-white border-l-4 border-signal-red">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-xl font-bold text-navy-900">{invoice.invoice_number}</h3>
                              <span className={`px-3 py-1 text-xs font-semibold ${
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
                            <p className="text-2xl font-bold text-navy-900">
                              €{invoice.amount.toFixed(2)}
                            </p>
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => markInvoiceAsPaid(invoice.id)}
                                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors duration-200"
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

            {activeTab === 'files' && (
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Files</h2>
                <Link
                  href={`/dashboard/clients/${client.id}/files`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                >
                  Manage Files
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Internal Notes</h2>
                <p className="text-sm text-slate-700 mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500">
                  <strong>Private:</strong> These notes are only visible to IE Global team members. Clients cannot see them.
                </p>

                {/* Add Note Form */}
                <div className="mb-8 p-6 bg-off-white border-l-4 border-signal-red">
                  <h3 className="text-lg font-bold text-navy-900 mb-4">Add New Note</h3>
                  <div className="space-y-4">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a private note about this client..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                    />
                    <button
                      onClick={addInternalNote}
                      disabled={addingNote || !newNote.trim()}
                      className="px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingNote ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                {internalNotes.length === 0 ? (
                  <div className="text-center py-12 bg-white">
                    <p className="text-slate-700">No internal notes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internalNotes.map((note) => (
                      <div key={note.id} className="bg-white p-6 border-l-4 border-yellow-500">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-navy-900">
                              {note.profiles?.full_name || 'Team Member'}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold">
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
          </div>
    </div>
  );
}

