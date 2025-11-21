'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function NewClientPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    industry: '',
    project_type: '',
    onboarding_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Create client
      const { data: newClient, error: clientError } = await (supabase as any)
        .from('clients')
        .insert({
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          industry: formData.industry || null,
          onboarding_notes: formData.onboarding_notes || null,
          assigned_employee_id: session.user.id,
          status: 'active',
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // TODO: Create client user account and send invitation email
      // This will be implemented in the next step

      // Redirect to client detail page
      router.push(`/dashboard/clients/${newClient.id}`);
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client');
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
              <Link href="/dashboard/templates" className="text-sm font-medium text-slate-700 hover:text-navy-900">
                Templates
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
              href="/dashboard/clients"
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-4 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Clients
            </Link>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Add New Client</h1>
            <p className="text-slate-700">Create a new client account and project workspace</p>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm">
                  {error}
                </div>
              )}

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-semibold text-navy-900 mb-2">
                  Company Name <span className="text-signal-red">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="contact_person" className="block text-sm font-semibold text-navy-900 mb-2">
                  Contact Person <span className="text-signal-red">*</span>
                </label>
                <input
                  type="text"
                  id="contact_person"
                  required
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contact_email" className="block text-sm font-semibold text-navy-900 mb-2">
                  Contact Email <span className="text-signal-red">*</span>
                </label>
                <input
                  type="email"
                  id="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-semibold text-navy-900 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-semibold text-navy-900 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Construction, Education"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
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
                  <option value="">Select project type...</option>
                  <option value="website">Website</option>
                  <option value="web_app">Web Application</option>
                  <option value="mobile_app">Mobile App</option>
                  <option value="integration">Integration & Automation</option>
                  <option value="optimization">Performance Optimization</option>
                  <option value="support">Ongoing Support</option>
                </select>
              </div>

              {/* Onboarding Notes */}
              <div>
                <label htmlFor="onboarding_notes" className="block text-sm font-semibold text-navy-900 mb-2">
                  Onboarding Notes (Internal)
                </label>
                <textarea
                  id="onboarding_notes"
                  rows={4}
                  value={formData.onboarding_notes}
                  onChange={(e) => setFormData({ ...formData, onboarding_notes: e.target.value })}
                  placeholder="Add any important notes about this client..."
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </button>
                <Link
                  href="/dashboard/clients"
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

