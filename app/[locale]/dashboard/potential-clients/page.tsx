'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

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

export default function PotentialClientsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [potentialClients, setPotentialClients] = useState<PotentialClient[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [proposalUrl, setProposalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'new' | 'contacted' | 'call_booked' | 'proposal_sent' | 'waiting' | 'won' | 'lost'>('contacted');
  const [source, setSource] = useState('');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low' | ''>('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile for potential clients:', profileError);
      }

      if (!profile || (profile.role !== 'admin' && profile.role !== 'partner')) {
        // Not allowed here – send to main dashboard or portal
        router.replace('/dashboard');
        return;
      }

      const { data, error: listError } = await (supabase as any)
        .from('potential_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (listError) {
        console.error('Error loading potential clients:', listError);
        setError('Failed to load potential clients.');
      } else {
        setPotentialClients(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error loading potential clients:', err);
      setError('Failed to load potential clients.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await (supabase as any)
        .from('potential_clients')
        .insert({
          company_name: companyName.trim(),
          contact_name: contactName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          proposal_url: proposalUrl.trim() || null,
          notes: notes.trim() || null,
          status,
          source: source.trim() || null,
          importance: importance || null,
          next_follow_up_date: nextFollowUpDate || null,
        });

      if (insertError) {
        console.error('Error adding potential client:', insertError);
        setError('Failed to add potential client.');
      } else {
        setCompanyName('');
        setContactName('');
        setEmail('');
        setPhone('');
        setProposalUrl('');
        setNotes('');
        setStatus('contacted');
        setSource('');
        setImportance('');
        setNextFollowUpDate('');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      console.error('Unexpected error adding potential client:', err);
      setError('Failed to add potential client.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = potentialClients.filter((c) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      c.company_name.toLowerCase().includes(query) ||
      (c.contact_name && c.contact_name.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query)) ||
      (c.proposal_url && c.proposal_url.toLowerCase().includes(query)) ||
      (c.notes && c.notes.toLowerCase().includes(query))
    );
  });

  const today = new Date().toISOString().split('T')[0];
  const followUpsToday = potentialClients.filter((c) => {
    if (!c.next_follow_up_date) return false;
    return c.next_follow_up_date <= today && c.status !== 'won' && c.status !== 'lost';
  });

  const warmLeads = potentialClients.filter((c) =>
    ['call_booked', 'proposal_sent', 'waiting'].includes(c.status || '')
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading potential clients...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Potential Clients
                  <span className="text-white/50 font-normal ml-2">
                    {filteredClients.length} of {potentialClients.length}
                  </span>
                </h1>
                <p className="text-white/60 text-sm mt-1">
                  Quick list of leads you&apos;ve contacted, with phones and proposal links.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-3 text-xs text-white/70">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{warmLeads.length} warm lead{warmLeads.length === 1 ? '' : 's'}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                  <span>{followUpsToday.length} follow-up{followUpsToday.length === 1 ? '' : 's'} today</span>
                </div>
              </div>
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Refresh"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {/* Today focus – only show when there is something to act on */}
          {(followUpsToday.length > 0 || warmLeads.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white text-navy-900 p-4 lg:p-5 shadow-sm border border-slate-200/80"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Today&apos;s call sheet
                  </p>
                  <p className="text-sm text-slate-700">
                    {followUpsToday.length > 0
                      ? `You have ${followUpsToday.length} follow-up${followUpsToday.length === 1 ? '' : 's'} scheduled.`
                      : `${warmLeads.length} warm lead${warmLeads.length === 1 ? '' : 's'} — decide who to move forward.`}
                  </p>
                </div>
              </div>
              {followUpsToday.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {followUpsToday.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-800">
                        {c.company_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-navy-900 truncate">{c.company_name}</p>
                        <p className="text-[11px] text-slate-600 truncate">
                          {c.contact_name || c.email || c.phone || 'No details yet'}
                        </p>
                      </div>
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] ${statusPillClass(
                          c.status || 'contacted'
                        )}`}
                      >
                        {statusLabel(c.status || 'contacted')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Add / search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white p-4 lg:p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potential clients</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Keep a simple list of people you&apos;ve talked to about working together.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Only visible to admins &amp; partners.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-signal-red text-white text-sm font-semibold shadow-sm hover:bg-signal-red/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add potential client
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
              <label className="block text-xs font-medium text-slate-600 mb-1">Quick search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, email, notes..."
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden"
          >
            {filteredClients.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-navy-900 mb-1">No potential clients yet</p>
                <p className="text-sm text-slate-600">
                  Add the people you&apos;ve contacted so you can find their details in seconds.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredClients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/potential-clients/${c.id}`}
                    className="block p-4 lg:p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-navy-900 truncate">
                            {c.company_name}
                          </p>
                          {c.contact_name && (
                            <span className="text-xs text-slate-500 truncate max-w-[180px]">
                              · {c.contact_name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${statusPillClass(
                              c.status || 'contacted'
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current/70" />
                            {statusLabel(c.status || 'contacted')}
                          </span>
                          {c.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.516.758a11.042 11.042 0 005.017 5.017l.758-1.516a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {c.phone}
                            </span>
                          )}
                          {c.email && (
                            <span className="inline-flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                                />
                              </svg>
                              {c.email}
                            </span>
                          )}
                          {c.proposal_url && (
                            <span className="inline-flex items-center gap-1.5 text-signal-red">
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
                              Open proposal
                            </span>
                          )}
                          {c.source && (
                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.428 15.341A8 8 0 104.57 15.34 8 8 0 0019.428 15.34z"
                                />
                              </svg>
                              {c.source}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-slate-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {new Date(c.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {c.notes && (
                          <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                            {c.notes}
                          </p>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-300 md:ml-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Add potential client modal */}
          {isAddModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-potential-client-title"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2
                    id="add-potential-client-title"
                    className="text-lg font-bold text-navy-900"
                  >
                    Add potential client
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
                  <p className="text-sm text-slate-600">
                    Add the basics so you can find this person in seconds later. You can always update the stage and notes.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Company / person<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme GmbH"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Main contact</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+49 ..."
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Proposal link</label>
                      <input
                        type="url"
                        value={proposalUrl}
                        onChange={(e) => setProposalUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Stage</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
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
                      <label className="block text-xs font-medium text-slate-600 mb-1">Source</label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Referral, LinkedIn, event..."
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Importance</label>
                      <select
                        value={importance}
                        onChange={(e) => setImportance(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      >
                        <option value="">Normal</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Next follow-up</label>
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Where you found them, last contact, next step..."
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red bg-white resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !companyName.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-signal-red text-white text-sm font-semibold shadow-sm hover:bg-signal-red/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting && (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                      )}
                      Add to list
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

