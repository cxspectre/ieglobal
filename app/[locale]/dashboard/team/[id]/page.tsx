'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';

type TeamMemberProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  birth_date: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  bio: string | null;
  created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  employee: 'Employee',
  partner: 'Partner',
};

function getRoleStyle(role: string) {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200';
    case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'partner': return 'bg-violet-100 text-violet-800 border-violet-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export default function TeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<TeamMemberProfile | null>(null);
  const [canAdd, setCanAdd] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
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

      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email, role, phone, birth_date, address_street, address_city, address_postal_code, address_country, bio, created_at')
        .eq('id', id)
        .single();

      if (error || !data) {
        setMember(null);
      } else {
        const role = data.role as string;
        if (!['admin', 'employee', 'partner'].includes(role)) {
          setMember(null);
        } else {
          setMember(data);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, router, supabase]);

  const resendInvite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!member) return;
    try {
      const res = await fetch('/api/resend-client-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: member.email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      alert('Invitation resent.');
    } catch {
      alert('Failed to resend invitation.');
    }
  };

  const deleteMember = async () => {
    if (!canAdd || !member || !confirm(`Remove ${member.full_name}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: member.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to remove');
      router.push('/dashboard/team');
    } catch (err) {
      alert((err as Error).message || 'Failed to remove');
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-navy-900 mb-2">Team member not found</h1>
          <p className="text-slate-600 mb-4">This person may have been removed or you don&apos;t have access.</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-white">{member.full_name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resendInvite}
                className="px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 rounded-xl transition-colors"
              >
                Resend invite
              </button>
              {canAdd && (
                <button
                  onClick={deleteMember}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-100 to-slate-50 min-h-[calc(100vh-120px)] p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          {/* Overview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {member.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-navy-900">{member.full_name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getRoleStyle(member.role)}`}>
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                </div>
                <a href={`mailto:${member.email}`} className="text-signal-red hover:underline text-sm">
                  {member.email}
                </a>
                <p className="text-xs text-slate-500 mt-1">Joined {formatDate(member.created_at)}</p>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                <p className="font-medium text-navy-900">{member.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Date of birth</p>
                <p className="font-medium text-navy-900">{formatDate(member.birth_date)}</p>
              </div>
            </div>
          </motion.div>

          {/* Address */}
          {(member.address_street || member.address_city) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Address</h2>
              <p className="text-navy-900">
                {member.address_street && <span>{member.address_street}<br /></span>}
                {(member.address_postal_code || member.address_city) && (
                  <span>{[member.address_postal_code, member.address_city].filter(Boolean).join(' ')}<br /></span>
                )}
                {member.address_country && <span>{member.address_country}</span>}
              </p>
            </motion.div>
          )}

          {/* Bio */}
          {member.bio && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Bio / notes</h2>
              <p className="text-navy-900 whitespace-pre-wrap">{member.bio}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
