'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  employee: 'Employee',
  partner: 'Partner',
  client: 'Client',
};

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [newMember, setNewMember] = useState({ email: '', fullName: '', role: 'employee' });
  const [creating, setCreating] = useState(false);
  const [canAdd, setCanAdd] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', session.user.id).single();

    if (profile?.role !== 'admin' && profile?.role !== 'employee' && profile?.role !== 'partner') {
      router.push('/portal');
      return;
    }

    setCanAdd(profile?.role === 'admin');

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .in('role', ['admin', 'employee', 'partner'])
      .order('created_at', { ascending: false });

    if (data) setMembers(data);
    setLoading(false);
  };

  const filteredMembers = members.filter((m) => {
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesSearch =
      search === '' ||
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const createMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    setCreating(true);
    try {
      const res = await fetch('/api/create-employee-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert(`Account created. Invitation sent to ${newMember.email}`);
      setNewMember({ email: '', fullName: '', role: 'employee' });
      await loadData();
    } catch (err: unknown) {
      alert('Failed: ' + (err as Error).message);
    }
    setCreating(false);
  };

  const deleteMember = async (id: string, name: string) => {
    if (!canAdd || !confirm(`Remove ${name}?`)) return;
    try {
      const res = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id }),
      });
      if (!res.ok) throw new Error('Failed');
      await loadData();
    } catch {
      alert('Failed to remove');
    }
  };

  const resendInvite = async (email: string) => {
    try {
      const res = await fetch('/api/resend-client-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert('Invitation resent.');
    } catch {
      alert('Failed to resend');
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'employee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
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

  const roleCounts = {
    admin: members.filter((m) => m.role === 'admin').length,
    employee: members.filter((m) => m.role === 'employee').length,
    partner: members.filter((m) => m.role === 'partner').length,
  };

  return (
    <div className="min-h-screen -m-6 lg:-m-8">
      <div className="pt-12 lg:pt-16 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-navy-900 px-6 py-4 shadow-xl shadow-black/15 border border-white/5">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg" aria-label="Back">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <p className="text-white/50 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Team
                  <span className="text-white/50 font-normal ml-2">{filteredMembers.length} of {members.length}</span>
                </h1>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Role filter strip */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: 'All', count: members.length },
                  { key: 'admin', label: 'Admin', count: roleCounts.admin },
                  { key: 'employee', label: 'Employee', count: roleCounts.employee },
                  { key: 'partner', label: 'Partner', count: roleCounts.partner },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setRoleFilter(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      roleFilter === key ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none text-sm"
                />
              </div>
            </div>
          </motion.div>

          {/* Add team member (admin only) */}
          {canAdd && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Add team member</h2>
              <form onSubmit={createMember} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  required
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  placeholder="Full name"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 outline-none"
                />
                <input
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Email"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 outline-none"
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="partner">Partner</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={creating} className="px-5 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Add & send invite'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Team list */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600">{search || roleFilter !== 'all' ? 'No matches' : 'No team members yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900">{m.full_name}</p>
                        <p className="text-sm text-slate-500">{m.email}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRoleStyle(m.role)}`}>
                        {ROLE_LABELS[m.role] || m.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => resendInvite(m.email)} className="px-3 py-1.5 text-sm font-medium text-signal-red hover:bg-signal-red/10 rounded-lg">
                        Resend
                      </button>
                      {canAdd && (
                        <button onClick={() => deleteMember(m.id, m.full_name)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
