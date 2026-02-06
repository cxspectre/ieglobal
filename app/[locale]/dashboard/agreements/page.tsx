'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { WORK_TYPES, COUNTRIES } from '@/lib/agreements';

type AgreementCategory = 'clients' | 'partners' | 'employees';

const AGREEMENT_TYPES = [
  { id: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
  { id: 'msa', label: 'Master Service Agreement (MSA)' },
  { id: 'sow', label: 'Statement of Work (SOW)' },
  { id: 'sla', label: 'Service Level Agreement (SLA)' },
  { id: 'osa', label: 'Ongoing Support Agreement' },
  { id: 'dpa', label: 'Data Processing Agreement (DPA)' },
] as const;

const PARTNER_AGREEMENT_TYPES = [
  { id: 'partnership', label: 'UI/UX Design Partnership Agreement (No Development)' },
] as const;

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  industry?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  vat_number?: string;
  kvk_number?: string;
};

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
};

const defaultClientForm = {
  agreementType: 'nda' as const,
  clientId: '',
  client_name: '',
  company_name: '',
  client_address: '',
  client_email: '',
  client_contact: '',
  client_phone: '',
  client_kvk: '',
  client_vat: '',
  work_types: [] as string[],
  country: 'Netherlands',
  effective_date: new Date().toISOString().slice(0, 10),
  term_months: '12',
  project_description: '',
  scope_summary: '',
  support_hours: '40',
  response_time_hours: '24',
};

const defaultPartnerForm = {
  agreementType: 'partnership' as const,
  partnerId: '',
  partner_name: '',
  partner_entity_type: 'individual / studio',
  partner_address: '',
  partner_email: '',
  partner_contact: '',
  effective_date: new Date().toISOString().slice(0, 10),
  communication_tools: 'Figma, Notion, Slack, Email',
  revision_rounds: '2',
  revision_rate: 'as agreed',
  acceptance_days: '5',
  fee_model: 'A',
  hourly_rate: '',
  day_rate: '',
  billing_frequency: 'monthly',
  fixed_fee: '',
  retainer_amount: '',
  retainer_hours: '',
  excess_rate: '',
  revenue_share_pct: '',
  revenue_share_days: '',
  invoice_days: '14',
  late_interest: 'statutory interest',
  confidentiality_years: '3',
  non_solicit_months: '12',
  liability_months: '12',
  notice_days: '30',
  cure_days: '10',
  governing_law: 'Netherlands',
  notice_email: 'cdrefke@ie-global.net',
};

export default function AgreementsPage() {
  const [category, setCategory] = useState<AgreementCategory>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = createBrowserClient();

  const [form, setForm] = useState<typeof defaultClientForm>(defaultClientForm);
  const [partnerForm, setPartnerForm] = useState<typeof defaultPartnerForm>(defaultPartnerForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, teamRes] = await Promise.all([
        supabase.from('clients').select('*').order('company_name'),
        supabase.from('profiles').select('id, full_name, email, role, address_street, address_city, address_postal_code, address_country').in('role', ['admin', 'employee', 'partner']).order('full_name'),
      ]);
      if (clientsRes.data) setClients(clientsRes.data as Client[]);
      if (teamRes.data) setTeamMembers(teamRes.data as TeamMember[]);
    } catch {
      setClients([]);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const selectClient = (client: Client | null) => {
    if (!client) {
      setForm((f) => ({ ...f, clientId: '', client_name: '', company_name: '', client_address: '', client_email: '', client_contact: '', client_phone: '', client_kvk: '', client_vat: '' }));
      return;
    }
    const addressParts = [client.address_street, [client.address_postal_code, client.address_city].filter(Boolean).join(' '), client.address_country].filter(Boolean);
    const address = addressParts.join(', ') || '';
    setForm((f) => ({
      ...f,
      clientId: client.id,
      client_name: client.contact_person || '',
      company_name: client.company_name || '',
      client_address: address,
      client_email: client.contact_email || '',
      client_contact: client.contact_person || '',
      client_phone: client.contact_phone ?? '',
      client_kvk: client.kvk_number ?? '',
      client_vat: client.vat_number ?? '',
    }));
  };

  const selectPartner = (member: TeamMember | null) => {
    if (!member) {
      setPartnerForm((f) => ({ ...f, partnerId: '', partner_name: '', partner_address: '', partner_email: '', partner_contact: '' }));
      return;
    }
    const addressParts = [member.address_street, [member.address_postal_code, member.address_city].filter(Boolean).join(' '), member.address_country].filter(Boolean);
    const address = addressParts.join(', ') || '';
    setPartnerForm((f) => ({
      ...f,
      partnerId: member.id,
      partner_name: member.full_name || '',
      partner_contact: member.full_name || '',
      partner_address: address,
      partner_email: member.email || '',
    }));
  };

  const toggleWorkType = (wt: string) => {
    setForm((f) => {
      const arr = f.work_types.includes(wt) ? f.work_types.filter((x) => x !== wt) : [...f.work_types, wt];
      return { ...f, work_types: arr };
    });
  };

  const handleGenerateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/agreements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementType: form.agreementType,
          client_name: form.client_name,
          company_name: form.company_name,
          client_address: form.client_address,
          client_email: form.client_email,
          client_contact: form.client_contact,
          client_phone: form.client_phone,
          client_kvk: form.client_kvk,
          client_vat: form.client_vat,
          work_types: form.work_types,
          country: form.country,
          effective_date: form.effective_date,
          term_months: form.term_months,
          project_description: form.project_description || undefined,
          scope_summary: form.scope_summary || undefined,
          support_hours: form.support_hours,
          response_time_hours: form.response_time_hours,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IE-Global-${form.agreementType.toUpperCase()}-${(form.company_name || 'client').replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/agreements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementType: 'partnership',
          ...partnerForm,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IE-Global-UI-UX-Partnership-${(partnerForm.partner_name || 'partner').replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const typeCount = category === 'clients' ? 6 : category === 'partners' ? 1 : 0;

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Back to dashboard">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Agreements
                  <span className="text-white/50 font-normal ml-2">{typeCount} type{typeCount !== 1 ? 's' : ''}</span>
                </h1>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-navy-900">3</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Agreement categories</p>
                  <p className="text-xs text-slate-500">Clients, Partners, Employees</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">PDF export</p>
                  <p className="text-xs text-slate-500">Client & partner ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-700">{clients.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Clients</p>
                  <p className="text-xs text-slate-500">pre-fill from list</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-violet-700">{teamMembers.length}</span>
                </div>
                <div>
                  <p className="font-semibold text-navy-900">Team</p>
                  <p className="text-xs text-slate-500">partners & employees</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-6 lg:p-8 shadow-sm border border-slate-200/80 max-w-2xl">
            {/* Category selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Agreement For *</label>
              <div className="flex flex-wrap gap-2">
                {(['clients', 'partners', 'employees'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all ${category === c ? 'bg-signal-red text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {c === 'clients' ? 'Clients' : c === 'partners' ? 'Partners' : 'Employees'}
                  </button>
                ))}
              </div>
            </div>

            {category === 'employees' && (
              <div className="rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <p className="font-medium text-navy-900 mb-1">Coming soon</p>
                <p className="text-sm">Employee agreements (employment contracts, etc.) will be available here.</p>
              </div>
            )}

            {category === 'clients' && (
              <form onSubmit={handleGenerateClient} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Agreement Type *</label>
                  <select
                    required
                    value={form.agreementType}
                    onChange={(e) => setForm((f) => ({ ...f, agreementType: e.target.value as typeof form.agreementType }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                  >
                    {AGREEMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <section className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Client Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Client (optional)</label>
                      <select
                        value={form.clientId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const client = clients.find((c) => String(c?.id) === String(id)) ?? null;
                          selectClient(client);
                        }}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                      >
                        <option value="">— Enter manually below —</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.company_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                        <input type="text" required value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person *</label>
                        <input type="text" required value={form.client_contact} onChange={(e) => setForm((f) => ({ ...f, client_contact: e.target.value, client_name: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Client Address</label>
                      <input type="text" value={form.client_address} onChange={(e) => setForm((f) => ({ ...f, client_address: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Client Email *</label>
                      <input type="email" required value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input type="text" value={form.client_phone} onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))} placeholder="+31 6 12 34 56 78" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">KvK number</label>
                        <input type="text" value={form.client_kvk} onChange={(e) => setForm((f) => ({ ...f, client_kvk: e.target.value }))} placeholder="12345678" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">VAT / BTW number</label>
                        <input type="text" value={form.client_vat} onChange={(e) => setForm((f) => ({ ...f, client_vat: e.target.value }))} placeholder="NL123456789B01" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">
                    {form.agreementType === 'nda' && 'NDA – Purpose & Jurisdiction'}
                    {form.agreementType === 'msa' && 'MSA – Scope & Term'}
                    {form.agreementType === 'sow' && 'SOW – Project Scope'}
                    {form.agreementType === 'sla' && 'SLA – Service Levels'}
                    {form.agreementType === 'osa' && 'OSA – Support Terms'}
                    {form.agreementType === 'dpa' && 'DPA – Data Processing Scope'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {form.agreementType === 'nda' && 'Purpose / Scope of disclosure'}
                        {(form.agreementType === 'msa' || form.agreementType === 'sow') && 'Services in scope'}
                        {(form.agreementType === 'sla' || form.agreementType === 'osa') && 'Services covered'}
                        {form.agreementType === 'dpa' && 'Data processing scope'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {WORK_TYPES.map((wt) => (
                          <label key={wt} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-white">
                            <input type="checkbox" checked={form.work_types.includes(wt)} onChange={() => toggleWorkType(wt)} className="rounded border-slate-300" />
                            <span className="text-sm">{wt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country / Jurisdiction *</label>
                        <select required value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900">
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date *</label>
                        <input type="date" required value={form.effective_date} onChange={(e) => setForm((f) => ({ ...f, effective_date: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                    {(form.agreementType === 'msa' || form.agreementType === 'osa') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Term (months)</label>
                        <input type="text" value={form.term_months} onChange={(e) => setForm((f) => ({ ...f, term_months: e.target.value }))} placeholder="e.g. 12" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    )}
                    {form.agreementType === 'sow' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Project Description *</label>
                          <textarea rows={3} required value={form.project_description} onChange={(e) => setForm((f) => ({ ...f, project_description: e.target.value }))} placeholder="Brief description of the project..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Scope & Deliverables</label>
                          <textarea rows={3} value={form.scope_summary} onChange={(e) => setForm((f) => ({ ...f, scope_summary: e.target.value }))} placeholder="Key deliverables, milestones..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                      </>
                    )}
                    {(form.agreementType === 'sla' || form.agreementType === 'osa') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Support Hours (per month)</label>
                          <input type="text" value={form.support_hours} onChange={(e) => setForm((f) => ({ ...f, support_hours: e.target.value }))} placeholder="e.g. 40" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Response Time (business hours)</label>
                          <input type="text" value={form.response_time_hours} onChange={(e) => setForm((f) => ({ ...f, response_time_hours: e.target.value }))} placeholder="e.g. 24" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button type="submit" disabled={generating} className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50 transition-colors">
                    {generating ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating PDF...</>) : (<><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Generate PDF</>)}
                  </button>
                  <p className="text-sm text-slate-500">Template output. Have legal counsel review before sending.</p>
                </div>
              </form>
            )}

            {category === 'partners' && (
              <form onSubmit={handleGeneratePartner} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Agreement Type *</label>
                  <select value="partnership" disabled className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-navy-900">
                    {PARTNER_AGREEMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <section className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Partner Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Partner from Team (optional)</label>
                      <select
                        value={partnerForm.partnerId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const member = teamMembers.find((m) => String(m?.id) === String(id)) ?? null;
                          selectPartner(member);
                        }}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900"
                      >
                        <option value="">— Enter manually below —</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Designer / Studio Name *</label>
                        <input type="text" required value={partnerForm.partner_name} onChange={(e) => setPartnerForm((f) => ({ ...f, partner_name: e.target.value, partner_contact: e.target.value }))} placeholder="Designer or studio name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Legal Entity Type</label>
                        <input type="text" value={partnerForm.partner_entity_type} onChange={(e) => setPartnerForm((f) => ({ ...f, partner_entity_type: e.target.value }))} placeholder="e.g. individual / studio" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Partner Address</label>
                      <input type="text" value={partnerForm.partner_address} onChange={(e) => setPartnerForm((f) => ({ ...f, partner_address: e.target.value }))} placeholder="Full address" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Partner Email *</label>
                      <input type="email" required value={partnerForm.partner_email} onChange={(e) => setPartnerForm((f) => ({ ...f, partner_email: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Partnership Terms</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date *</label>
                        <input type="date" required value={partnerForm.effective_date} onChange={(e) => setPartnerForm((f) => ({ ...f, effective_date: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Communication Tools</label>
                        <input type="text" value={partnerForm.communication_tools} onChange={(e) => setPartnerForm((f) => ({ ...f, communication_tools: e.target.value }))} placeholder="Figma, Notion, Slack, Email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Revision Rounds</label>
                        <input type="text" value={partnerForm.revision_rounds} onChange={(e) => setPartnerForm((f) => ({ ...f, revision_rounds: e.target.value }))} placeholder="2" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Revision Rate (extra)</label>
                        <input type="text" value={partnerForm.revision_rate} onChange={(e) => setPartnerForm((f) => ({ ...f, revision_rate: e.target.value }))} placeholder="as agreed" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Acceptance Days</label>
                        <input type="text" value={partnerForm.acceptance_days} onChange={(e) => setPartnerForm((f) => ({ ...f, acceptance_days: e.target.value }))} placeholder="5" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fee Model</label>
                      <select value={partnerForm.fee_model} onChange={(e) => setPartnerForm((f) => ({ ...f, fee_model: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900">
                        <option value="A">A — Hourly/Day Rate</option>
                        <option value="B">B — Fixed Fee Per Deliverable</option>
                        <option value="C">C — Retainer</option>
                        <option value="D">D — Revenue Share</option>
                      </select>
                    </div>
                    {partnerForm.fee_model === 'A' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (€)</label>
                          <input type="text" value={partnerForm.hourly_rate} onChange={(e) => setPartnerForm((f) => ({ ...f, hourly_rate: e.target.value }))} placeholder="e.g. 95" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Day Rate (€)</label>
                          <input type="text" value={partnerForm.day_rate} onChange={(e) => setPartnerForm((f) => ({ ...f, day_rate: e.target.value }))} placeholder="e.g. 750" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Billing</label>
                          <select value={partnerForm.billing_frequency} onChange={(e) => setPartnerForm((f) => ({ ...f, billing_frequency: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900">
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {partnerForm.fee_model === 'B' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fixed Fee per Milestone (€)</label>
                        <input type="text" value={partnerForm.fixed_fee} onChange={(e) => setPartnerForm((f) => ({ ...f, fixed_fee: e.target.value }))} placeholder="e.g. 1500" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                    )}
                    {partnerForm.fee_model === 'C' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Retainer (€/month)</label>
                          <input type="text" value={partnerForm.retainer_amount} onChange={(e) => setPartnerForm((f) => ({ ...f, retainer_amount: e.target.value }))} placeholder="e.g. 2000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hours Included</label>
                          <input type="text" value={partnerForm.retainer_hours} onChange={(e) => setPartnerForm((f) => ({ ...f, retainer_hours: e.target.value }))} placeholder="e.g. 20" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Excess Rate (€/hr)</label>
                          <input type="text" value={partnerForm.excess_rate} onChange={(e) => setPartnerForm((f) => ({ ...f, excess_rate: e.target.value }))} placeholder="e.g. 95" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                      </div>
                    )}
                    {partnerForm.fee_model === 'D' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Revenue Share %</label>
                          <input type="text" value={partnerForm.revenue_share_pct} onChange={(e) => setPartnerForm((f) => ({ ...f, revenue_share_pct: e.target.value }))} placeholder="e.g. 15" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Days After Receipt</label>
                          <input type="text" value={partnerForm.revenue_share_days} onChange={(e) => setPartnerForm((f) => ({ ...f, revenue_share_days: e.target.value }))} placeholder="e.g. 30" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Days</label>
                        <input type="text" value={partnerForm.invoice_days} onChange={(e) => setPartnerForm((f) => ({ ...f, invoice_days: e.target.value }))} placeholder="14 or 30" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Governing Law</label>
                        <select value={partnerForm.governing_law} onChange={(e) => setPartnerForm((f) => ({ ...f, governing_law: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none text-navy-900">
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button type="submit" disabled={generating} className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50 transition-colors">
                    {generating ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating PDF...</>) : (<><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Generate PDF</>)}
                  </button>
                  <p className="text-sm text-slate-500">Template output. Have legal counsel review before signing.</p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
