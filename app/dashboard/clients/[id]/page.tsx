'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';
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

      if (projectsData) setProjects(projectsData);

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', params.id)
        .order('issue_date', { ascending: false });

      if (invoicesData) setInvoices(invoicesData);

      // Load internal notes
      const { data: notesData } = await (supabase as any)
        .from('internal_notes')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (notesData) setInternalNotes(notesData);

      // Check if client has portal account
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('email, active')
        .eq('client_id', params.id)
        .maybeSingle();

      if (profileData) {
        setClientHasAccount(true);
        setClientAccountEmail(profileData.email);
        setClientAccountActive(profileData.active);
      }

      setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleClientStatus = async () => {
    if (!client) return;
    
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    
    const { error } = await (supabase as any)
      .from('clients')
      .update({ status: newStatus })
      .eq('id', client.id);

    if (!error) {
      setClient({ ...client, status: newStatus });
      
      // Log activity
      await (supabase as any).from('activities').insert({
        client_id: client.id,
        user_id: (await supabase.auth.getSession()).data.session?.user.id,
        action_type: 'status_changed',
        description: `Client status changed to ${newStatus}`,
      });
    }
  };

  const deleteClient = async () => {
    if (!confirm(`Are you sure you want to delete ${client?.company_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('clients')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      router.push('/dashboard/clients');
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditForm({
      company_name: client?.company_name,
      contact_person: client?.contact_person,
      contact_email: client?.contact_email,
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
        .update(editForm)
        .eq('id', params.id);

      if (error) throw error;

      // Log activity
      await (supabase as any).from('activities').insert({
        client_id: params.id,
        user_id: (await supabase.auth.getSession()).data.session?.user.id,
        action_type: 'client_updated',
        description: `Client information updated`,
      });

      // Reload data
      await loadData();
      setIsEditing(false);
      alert('✅ Client updated successfully');
    } catch (err: any) {
      console.error('Error updating client:', err);
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

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      if (!client) {
        alert('Client data not loaded');
        return;
      }

      // Generate PDF
      const pdfBlob = await generateInvoicePDF({
        invoiceNumber: invoice.invoice_number,
        customerNumber: client.customer_number || '',
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        clientName: client.company_name,
        clientContact: client.contact_person,
        clientAddress: {
          street: client.address_street || '',
          city: client.address_city || '',
          postalCode: client.address_postal_code || '',
          country: client.address_country || 'Netherlands',
        },
        clientKvK: client.kvk_number || '',
        clientVAT: client.vat_number || '',
        subtotal: invoice.amount / 1.21,
        vatRate: 21,
        vatAmount: invoice.amount - invoice.amount / 1.21,
        totalAmount: invoice.amount,
        currency: invoice.currency,
        description: invoice.description || 'Professional Services',
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate invoice PDF. Please try again.');
    }
  };

  const addInternalNote = async () => {
    if (!newNote.trim()) return;
    
    setAddingNote(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await (supabase as any).from('internal_notes').insert({
        client_id: params.id,
        note_text: newNote.trim(),
        created_by: session?.user.id,
      });

      if (error) throw error;

      // Reload notes
      const { data: notesData } = await (supabase as any)
        .from('internal_notes')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (notesData) setInternalNotes(notesData);
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
      {/* Header Bar with Breadcrumb */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Clients
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={deleteClient}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border-l-4 border-signal-red sticky top-6">
            {/* Client Info Card */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-navy-900 mb-2">{client.company_name}</h2>
              <p className="text-sm text-slate-700 mb-1">{client.contact_person}</p>
              <p className="text-sm text-slate-600 mb-4">{client.contact_email}</p>
              
              <button
                onClick={toggleClientStatus}
                className={`w-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:opacity-90 ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {client.status === 'active' ? '✓ Active' : '○ Inactive'}
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'overview'
                    ? 'bg-signal-red/10 text-signal-red border-l-4 border-signal-red'
                    : 'text-slate-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'projects'
                    ? 'bg-signal-red/10 text-signal-red border-l-4 border-signal-red'
                    : 'text-slate-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Projects <span className="ml-auto bg-navy-900 text-white px-2 py-0.5 rounded-full text-xs">{projects.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'invoices'
                    ? 'bg-signal-red/10 text-signal-red border-l-4 border-signal-red'
                    : 'text-slate-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                Invoices <span className="ml-auto bg-navy-900 text-white px-2 py-0.5 rounded-full text-xs">{invoices.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'files'
                    ? 'bg-signal-red/10 text-signal-red border-l-4 border-signal-red'
                    : 'text-slate-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Files
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  activeTab === 'notes'
                    ? 'bg-signal-red/10 text-signal-red border-l-4 border-signal-red'
                    : 'text-slate-700 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Internal Notes <span className="ml-auto bg-navy-900 text-white px-2 py-0.5 rounded-full text-xs">{internalNotes.length}</span>
              </button>
            </nav>

            {/* Portal Access Card */}
            {!clientHasAccount ? (
              <div className="p-6 border-t border-gray-200 bg-blue-50">
                <h3 className="text-sm font-semibold text-navy-900 mb-2">Portal Access</h3>
                <p className="text-xs text-slate-600 mb-3">No portal account yet</p>
                <button
                  onClick={createClientAccount}
                  disabled={creatingAccount}
                  className="w-full px-4 py-2 bg-navy-900 text-white text-sm font-semibold hover:bg-navy-900/90 transition-all duration-200 disabled:opacity-50"
                >
                  {creatingAccount ? 'Creating...' : 'Create Portal Account'}
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-gray-200 bg-green-50">
                <h3 className="text-sm font-semibold text-navy-900 mb-2">Portal Access</h3>
                <p className="text-xs text-green-700 mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {clientAccountActive ? 'Account Active' : 'Pending Activation'}
                </p>
                <p className="text-xs text-slate-600 mb-3">{clientAccountEmail}</p>
                {!clientAccountActive && (
                  <button
                    onClick={resendInvitation}
                    disabled={resendingInvite}
                    className="w-full px-4 py-2 bg-navy-900 text-white text-xs font-semibold hover:bg-navy-900/90 transition-all duration-200 disabled:opacity-50"
                  >
                    {resendingInvite ? 'Sending...' : 'Resend Invitation'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy-900">Client Details</h2>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Client
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-6 py-2 bg-gray-100 text-navy-900 text-sm font-semibold hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={saveLoading}
                      className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-colors duration-200 disabled:opacity-50"
                    >
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                /* EDIT MODE */
                <div className="space-y-6">
                  {/* Company Information Card */}
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">Company Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={editForm.company_name}
                          onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Industry</label>
                        <input
                          type="text"
                          value={editForm.industry}
                          onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Customer Number</label>
                        <input
                          type="text"
                          value={editForm.customer_number}
                          onChange={(e) => setEditForm({ ...editForm, customer_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Contact Person</label>
                        <input
                          type="text"
                          value={editForm.contact_person}
                          onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.contact_email}
                          onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Phone</label>
                        <input
                          type="text"
                          value={editForm.contact_phone}
                          onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Billing Address Card */}
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">Billing Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={editForm.address_street}
                          onChange={(e) => setEditForm({ ...editForm, address_street: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-navy-900 mb-2">Postal Code</label>
                          <input
                            type="text"
                            value={editForm.address_postal_code}
                            onChange={(e) => setEditForm({ ...editForm, address_postal_code: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy-900 mb-2">City</label>
                          <input
                            type="text"
                            value={editForm.address_city}
                            onChange={(e) => setEditForm({ ...editForm, address_city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">Country</label>
                        <input
                          type="text"
                          value={editForm.address_country}
                          onChange={(e) => setEditForm({ ...editForm, address_country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Information Card */}
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">Legal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">VAT Number</label>
                        <input
                          type="text"
                          value={editForm.vat_number}
                          onChange={(e) => setEditForm({ ...editForm, vat_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-navy-900 mb-2">KvK Number</label>
                        <input
                          type="text"
                          value={editForm.kvk_number}
                          onChange={(e) => setEditForm({ ...editForm, kvk_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Notes Card */}
                  <div className="bg-white p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-navy-900 mb-4 border-b border-gray-200 pb-2">Onboarding Notes</h3>
                    <textarea
                      value={editForm.onboarding_notes}
                      onChange={(e) => setEditForm({ ...editForm, onboarding_notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                      placeholder="Add any relevant notes about client onboarding, special requirements, etc."
                    />
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="space-y-6">
                  {/* Company Information Card */}
                  <div className="bg-white p-6 border-l-4 border-navy-900">
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Company Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Company Name</p>
                        <p className="font-semibold text-navy-900">{client.company_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Industry</p>
                        <p className="font-semibold text-navy-900">{client.industry || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Customer Number</p>
                        <p className="font-semibold text-navy-900">{client.customer_number || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Client Since</p>
                        <p className="font-semibold text-navy-900">
                          {new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white p-6 border-l-4 border-signal-red">
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Contact Person</p>
                        <p className="font-semibold text-navy-900">{client.contact_person}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Email</p>
                        <a href={`mailto:${client.contact_email}`} className="font-semibold text-signal-red hover:underline">{client.contact_email}</a>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-slate-600 mb-1">Phone</p>
                        <p className="font-semibold text-navy-900">{client.contact_phone || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address Card */}
                  <div className="bg-white p-6 border-l-4 border-green-600">
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Billing Address</h3>
                    <div className="space-y-2 text-slate-700">
                      <p>{client.address_street || '—'}</p>
                      <p>{client.address_postal_code && client.address_city ? `${client.address_postal_code} ${client.address_city}` : '—'}</p>
                      <p>{client.address_country || '—'}</p>
                    </div>
                  </div>

                  {/* Legal Information Card */}
                  <div className="bg-white p-6 border-l-4 border-blue-600">
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Legal Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">VAT Number</p>
                        <p className="font-semibold text-navy-900">{client.vat_number || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">KvK Number</p>
                        <p className="font-semibold text-navy-900">{client.kvk_number || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Onboarding Notes Card */}
                  {client.onboarding_notes && (
                    <div className="bg-amber-50 p-6 border-l-4 border-amber-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Onboarding Notes</h3>
                      <p className="text-slate-700 whitespace-pre-wrap">{client.onboarding_notes}</p>
                    </div>
                  )}

                  {/* Invitation Link (if exists) */}
                  {invitationLink && (
                    <div className="bg-blue-50 p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Portal Invitation Link</h3>
                      <p className="text-xs text-slate-600 mb-2">Share this link with the client to set up their portal access:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={invitationLink}
                          readOnly
                          className="flex-1 px-4 py-2 bg-white border border-blue-300 text-sm font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(invitationLink);
                            alert('Link copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold hover:bg-navy-900/90"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Projects</h2>
                <Link
                  href={`/dashboard/clients/${params.id}/projects/new`}
                  className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-700 mb-4">No projects yet</p>
                  <Link
                    href={`/dashboard/clients/${params.id}/projects/new`}
                    className="inline-block px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
                  >
                    Create First Project
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white p-6 border-l-4 border-signal-red hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-navy-900 mb-2">{project.name}</h3>
                          {project.description && (
                            <p className="text-slate-700 mb-4">{project.description}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className={`px-3 py-1 text-xs font-semibold ${
                                project.status === 'active' ? 'bg-green-100 text-green-800' :
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-signal-red transition-all duration-300"
                                  style={{ width: `${project.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-slate-600 font-semibold">{project.progress_percentage}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            href={`/dashboard/projects/${project.id}/milestones`}
                            className="px-4 py-2 bg-gray-100 text-navy-900 text-sm font-semibold hover:bg-gray-200 transition-colors duration-200"
                          >
                            Milestones
                          </Link>
                          <Link
                            href={`/dashboard/projects/${project.id}/messages`}
                            className="px-4 py-2 bg-navy-900 text-white text-sm font-semibold hover:bg-navy-900/90 transition-colors duration-200"
                          >
                            Messages
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Invoices</h2>
                <Link
                  href={`/dashboard/clients/${params.id}/invoices/new`}
                  className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Invoice
                </Link>
              </div>

              {invoices.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  <p className="text-slate-700 mb-4">No invoices yet</p>
                  <Link
                    href={`/dashboard/clients/${params.id}/invoices/new`}
                    className="inline-block px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
                  >
                    Create First Invoice
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="bg-white p-6 border-l-4 border-signal-red hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
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
                            <p className="text-slate-700 mb-4 text-sm">{invoice.description}</p>
                          )}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Issued</p>
                              <p className="font-semibold text-navy-900">
                                {new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Due</p>
                              <p className="font-semibold text-navy-900">
                                {new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            {invoice.paid_date && (
                              <div>
                                <p className="text-slate-600">Paid</p>
                                <p className="font-semibold text-green-700">
                                  {new Date(invoice.paid_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3 ml-6">
                          <p className="text-3xl font-bold text-navy-900">
                            €{invoice.amount.toFixed(2)}
                          </p>
                          <div className="flex gap-2">
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => markInvoiceAsPaid(invoice.id)}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors duration-200"
                              >
                                Mark as Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="px-4 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-navy-900">Files</h2>
                <Link
                  href={`/dashboard/clients/${params.id}/files`}
                  className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Files
                </Link>
              </div>

              <div className="bg-white p-12 text-center border border-dashed border-gray-300">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-slate-700 mb-4">File management</p>
                <Link
                  href={`/dashboard/clients/${params.id}/files`}
                  className="inline-block px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
                >
                  Go to Files Section
                </Link>
              </div>
            </div>
          )}

          {/* INTERNAL NOTES TAB */}
          {activeTab === 'notes' && (
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Internal Notes</h2>

              {/* Add Note Form */}
              <div className="bg-white p-6 border-l-4 border-signal-red mb-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-4">Add New Note</h3>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  placeholder="Add an internal note about this client..."
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none mb-3"
                />
                <button
                  onClick={addInternalNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-6 py-2 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>

              {/* Notes List */}
              {internalNotes.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-slate-700">No internal notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {internalNotes.map((note) => (
                    <div key={note.id} className="bg-white p-6 border-l-4 border-gray-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-navy-900">{note.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(note.created_at).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
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
    </div>
  );
}
