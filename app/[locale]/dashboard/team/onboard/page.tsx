'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

export default function OnboardTeamMemberPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canAdd, setCanAdd] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    role: 'employee' as 'admin' | 'employee' | 'partner',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
    addressCountry: 'Netherlands',
    bio: '',
    sendInvite: true,
  });

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', session.user.id).single();
      setCanAdd(profile?.role === 'admin');
      setLoading(false);
    };
    check();
  }, [router, supabase.auth]);

  const update = (updates: Partial<typeof formData>) => {
    setFormData({ ...formData, ...updates });
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.email || !formData.role) {
      setError('Full name, email, and role are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/create-employee-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          phone: formData.phone || undefined,
          birth_date: formData.birthDate || undefined,
          address_street: formData.addressStreet || undefined,
          address_city: formData.addressCity || undefined,
          address_postal_code: formData.addressPostalCode || undefined,
          address_country: formData.addressCountry || undefined,
          bio: formData.bio || undefined,
          sendInvite: formData.sendInvite,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      router.push('/dashboard/team');
      return;
    } catch (err) {
      setError((err as Error).message);
    }
    setSubmitting(false);
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

  if (!canAdd) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-slate-600 mb-4">You don&apos;t have permission to add team members.</p>
          <Link href="/dashboard/team" className="text-signal-red font-medium hover:underline">Back to Team</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[900px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/team" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg" aria-label="Back">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Onboard team member</h1>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
                {error}
              </div>
            )}

            {/* Personal info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Personal information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Full name <span className="text-signal-red">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => update({ fullName: e.target.value })}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Email <span className="text-signal-red">*</span></label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => update({ email: e.target.value })}
                    placeholder="jane@ie-global.net"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    placeholder="+31 6 12345678"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => update({ birthDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Role */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Role & access</h2>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Role <span className="text-signal-red">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => update({ role: e.target.value as 'admin' | 'employee' | 'partner' })}
                  className="w-full md:w-64 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="partner">Partner</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  {formData.role === 'admin' && 'Full access to all features including financial data.'}
                  {formData.role === 'employee' && 'Access to clients, projects, and team. No financial data.'}
                  {formData.role === 'partner' && 'Access to assigned clients and projects. No financial data.'}
                </p>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Street</label>
                  <input
                    type="text"
                    value={formData.addressStreet}
                    onChange={(e) => update({ addressStreet: e.target.value })}
                    placeholder="Keizersgracht 123"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.addressCity}
                    onChange={(e) => update({ addressCity: e.target.value })}
                    placeholder="Amsterdam"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Postal code</label>
                  <input
                    type="text"
                    value={formData.addressPostalCode}
                    onChange={(e) => update({ addressPostalCode: e.target.value })}
                    placeholder="1015 CJ"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={formData.addressCountry}
                    onChange={(e) => update({ addressCountry: e.target.value })}
                    placeholder="Netherlands"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Bio / notes */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Bio / notes</h2>
              <textarea
                value={formData.bio}
                onChange={(e) => update({ bio: e.target.value })}
                placeholder="Short bio, role description, or internal notes..."
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none"
              />
            </motion.div>

            {/* Invite option & submit */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendInvite}
                    onChange={(e) => update({ sendInvite: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-signal-red focus:ring-signal-red"
                  />
                  <span className="text-sm font-medium text-navy-900">Send invitation email to set password</span>
                </label>
                <div className="flex gap-3">
                  <Link href="/dashboard/team" className="px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? 'Creating...' : 'Create & invite'}
                  </button>
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
}
