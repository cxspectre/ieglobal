'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type PotentialClient = {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  proposal_url: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'call_booked' | 'proposal_sent' | 'waiting' | 'won' | 'lost' | null;
  source: string | null;
  importance: string | null;
  last_contacted_date: string | null;
  next_follow_up_date: string | null;
};

export default function PotentialClientDetailPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<PotentialClient | null>(null);
  const [status, setStatus] = useState<PotentialClient['status']>('contacted');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low' | ''>('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [notes, setNotes] = useState('');

  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadClient();
  }, [params.id as string]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || (profile.role !== 'admin' && profile.role !== 'partner')) {
        router.replace('/dashboard');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('potential_clients')
        .select('*')
        .eq('id', params.id as string)
        .single();

      if (error || !data) {
        console.error('Error loading potential client:', error);
        setClient(null);
      } else {
        setClient(data as PotentialClient);
        setStatus((data.status as PotentialClient['status']) || 'contacted');
        setImportance((data.importance as 'high' | 'medium' | 'low' | '') || '');
        setNextFollowUp(data.next_follow_up_date || '');
        setNotes(data.notes || '');
      }
    } catch (err) {
      console.error('Unexpected error loading potential client detail:', err);
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s: PotentialClient['status']) => {
    switch (s) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'call_booked': return 'Call booked';
      case 'proposal_sent': return 'Proposal sent';
      case 'waiting': return 'Waiting';
      case 'won': return 'Won';
      case 'lost': return 'Lost';
      default: return 'Contacted';
    }
  };

  const statusPillClass = (s: PotentialClient['status']) => {
    switch (s) {
      case 'new':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'contacted':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'call_booked':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'proposal_sent':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'waiting':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const saveChanges = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const payload = {
        status,
        importance: importance || null,
        next_follow_up_date: nextFollowUp || null,
        notes: notes || null,
      };

      const { error } = await (supabase as any)
        .from('potential_clients')
        .update(payload)
        .eq('id', client.id);

      if (error) {
        console.error('Error updating potential client:', error);
        alert('Failed to save changes.');
      } else {
        setClient({ ...client, ...payload });
      }
    } catch (err) {
      console.error('Unexpected error updating potential client:', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading potential client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Potential client not found</h1>
          <Link href="/dashboard/potential-clients" className="text-signal-red font-medium hover:underline">
            Back to Potential Clients
          </Link>
        </div>
      </div>
    );
  }

  const createdDisplay = new Date(client.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      {/* Floating hero nav */}
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/dashboard/potential-clients"
                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Back to potential clients"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{client.company_name}</h1>
                <p className="text-white/60 text-sm mt-0.5">
                  {client.contact_name || client.email || client.phone || 'No primary contact yet'}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusPillClass(
                  client.status || 'contacted'
                )}`}
              >
                {statusLabel(client.status || 'contacted')}
              </span>
              {client.importance && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full capitalize bg-white/10 text-white border border-white/20">
                  {client.importance} importance
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-white/60">
                Added on {createdDisplay}
              </span>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  {client.contact_name && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Main contact</p>
                      <p className="font-medium text-navy-900">{client.contact_name}</p>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Email</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="font-medium text-signal-red hover:underline break-all"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="font-medium text-navy-900"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.proposal_url && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Proposal</p>
                      <a
                        href={client.proposal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-signal-red hover:underline break-all"
                      >
                        Open proposal
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">Stage</p>
                    <p className="font-medium text-navy-900">
                      {statusLabel(client.status || 'contacted')}
                    </p>
                  </div>
                  {client.source && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Source</p>
                      <p className="font-medium text-navy-900">{client.source}</p>
                    </div>
                  )}
                  {client.next_follow_up_date && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Next follow-up</p>
                      <p className="font-medium text-navy-900">
                        {new Date(client.next_follow_up_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {client.last_contacted_date && (
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">Last contacted</p>
                      <p className="font-medium text-navy-900">
                        {new Date(client.last_contacted_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-slate-500 text-xs mb-1">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {client.notes || 'No notes yet.'}
                </p>
              </div>
            </motion.div>

            {/* Right: editable pipeline info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4 lg:sticky lg:top-6"
            >
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Update status
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Stage</label>
                  <select
                    value={status || 'contacted'}
                    onChange={(e) => setStatus(e.target.value as PotentialClient['status'])}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="call_booked">Call booked</option>
                    <option value="proposal_sent">Proposal sent</option>
                    <option value="waiting">Waiting</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Importance</label>
                  <select
                    value={importance}
                    onChange={(e) => setImportance(e.target.value as 'high' | 'medium' | 'low' | '')}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white text-sm"
                  >
                    <option value="">Normal</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Next follow-up</label>
                  <input
                    type="date"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Where you left off, objections, next step..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white text-sm resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/dashboard/potential-clients"
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Back
                </Link>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-signal-red text-white text-sm font-semibold shadow-sm hover:bg-signal-red/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  )}
                  Save changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

