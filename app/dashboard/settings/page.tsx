'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

type Activity = {
  id: string;
  description: string;
  created_at: string;
  action_type: string;
};

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy', email: 'healthy' });
  const [newEmployee, setNewEmployee] = useState({ email: '', fullName: '', role: 'employee' });
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    checkSystemHealth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any).from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
      }
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/login');
    }
  };

  const loadDashboardData = async () => {
    // Employees
    const { data: empData } = await (supabase as any).from('profiles').select('*').in('role', ['admin', 'employee']).order('created_at', { ascending: false });
    if (empData) setEmployees(empData);

    // Activity
    const { data: actData } = await (supabase as any).from('activities').select('*').order('created_at', { ascending: false }).limit(10);
    if (actData) setRecentActivity(actData);

    setLoading(false);
  };

  const checkSystemHealth = async () => {
    try {
      await (supabase as any).from('clients').select('id').limit(1);
      await supabase.storage.listBuckets();
      setSystemHealth({ database: 'healthy', storage: 'healthy', email: 'healthy' });
    } catch {
      setSystemHealth({ database: 'error', storage: 'error', email: 'healthy' });
    }
  };

  const createEmployeeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/create-employee-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      alert(`Employee account created!\n\nInvitation sent to: ${newEmployee.email}`);
      setNewEmployee({ email: '', fullName: '', role: 'employee' });
      await loadDashboardData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setCreating(false);
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Delete ${employeeName}? This will remove their dashboard access.`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert(`${employeeName} has been removed.`);
      await loadDashboardData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const resendEmployeeInvite = async (email: string) => {
    try {
      const response = await fetch('/api/resend-client-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      if (result.invitationLink) {
        alert(`Invitation resent to ${email}!\n\nBackup link:\n${result.invitationLink}`);
      } else {
        alert(`Invitation resent to ${email}`);
      }
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Command Center</h1>
          <p className="text-lg text-slate-700">
            Services, tools, team & company information
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-8 overflow-x-auto px-6 border-b border-gray-200">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'team', label: 'Team Management' },
            { key: 'services', label: 'Services' },
            { key: 'company', label: 'Company Info' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activeTab === tab.key
                  ? 'text-navy-900 border-signal-red'
                  : 'text-slate-700 hover:text-navy-900 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tools & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Access Tools */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Quick Access</h2>
                <p className="text-sm text-slate-600">One-click access to essential tools and services</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">Supabase</p>
                      <p className="text-xs text-slate-600">Database & Auth</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
                
                <a 
                  href="https://resend.com/emails" 
                  target="_blank" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">Resend</p>
                      <p className="text-xs text-slate-600">Email Service</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
                
                <a 
                  href="https://vercel.com/dashboard" 
                  target="_blank" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">Vercel</p>
                      <p className="text-xs text-slate-600">Hosting</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
                
                <a 
                  href="https://github.com/cxspectre/ieglobal" 
                  target="_blank" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">GitHub</p>
                      <p className="text-xs text-slate-600">Repository</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
                
                <a 
                  href="https://ie-global.net" 
                  target="_blank" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-signal-red rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">Website</p>
                      <p className="text-xs text-slate-600">ie-global.net</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
                
                <Link 
                  href="/portal" 
                  className="p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-navy-900 text-sm">Portal</p>
                      <p className="text-xs text-slate-600">Client Portal</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* One-Click Actions */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Quick Actions</h2>
                <p className="text-sm text-slate-600">Common tasks and shortcuts</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/dashboard/clients/new" 
                  className="p-6 bg-signal-red text-white hover:bg-signal-red/90 transition-all duration-200 rounded-lg group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="font-bold text-lg">New Client</p>
                  </div>
                  <p className="text-sm text-white/80">Add client & project</p>
                </Link>
                
                <button
                  onClick={() => setActiveTab('team')}
                  className="p-6 bg-navy-900 text-white hover:bg-navy-800 transition-all duration-200 rounded-lg group text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="font-bold text-lg">New Team Member</p>
                  </div>
                  <p className="text-sm text-white/80">Invite employee</p>
                </button>
                
                <Link 
                  href="/dashboard/clients" 
                  className="p-6 bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 rounded-lg group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="font-bold text-navy-900 text-lg">View All Clients</p>
                  </div>
                  <p className="text-sm text-slate-600">Manage accounts</p>
                </Link>
                
                <Link 
                  href="/" 
                  className="p-6 bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 rounded-lg group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p className="font-bold text-navy-900 text-lg">View Website</p>
                  </div>
                  <p className="text-sm text-slate-600">ie-global.net</p>
                </Link>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Recent Activity</h2>
                <p className="text-sm text-slate-600">Latest system events and actions</p>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-slate-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0">
                      <div className="w-2 h-2 bg-signal-red rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status & Team */}
          <div className="space-y-8">
            {/* System Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-navy-900 mb-2">System Status</h3>
                <p className="text-sm text-slate-600">Service health monitoring</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Database', status: systemHealth.database },
                  { name: 'Storage', status: systemHealth.storage },
                  { name: 'Email', status: systemHealth.email },
                ].map((system) => (
                  <div key={system.name} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <span className="text-sm font-semibold text-navy-900">{system.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        system.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs font-semibold text-slate-600 capitalize">{system.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Directory */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Team</h3>
                  <p className="text-sm text-slate-600">{employees.length} members</p>
                </div>
                <button
                  onClick={() => setActiveTab('team')}
                  className="text-sm font-semibold text-signal-red hover:text-signal-red/80"
                >
                  Manage →
                </button>
              </div>
              <div className="space-y-3">
                {employees.slice(0, 5).map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{emp.full_name}</p>
                      <p className="text-xs text-slate-600">{emp.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {emp.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Info Quick Reference */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-navy-900 mb-2">Company Info</h3>
                <p className="text-sm text-slate-600">Quick reference</p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-off-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">KvK</p>
                  <p className="font-mono font-semibold text-navy-900">97185515</p>
                </div>
                <div className="p-3 bg-off-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">VAT</p>
                  <p className="font-mono font-semibold text-navy-900">NL737599054B02</p>
                </div>
                <div className="p-3 bg-off-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Email</p>
                  <a href="mailto:hello@ie-global.net" className="font-semibold text-signal-red hover:underline">
                    hello@ie-global.net
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Management Tab */}
      {activeTab === 'team' && (
        <div className="space-y-8">
          {/* Employee Directory */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Team Directory</h2>
              <p className="text-sm text-slate-600">Manage team members and permissions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-off-white border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-navy-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-off-white transition-colors">
                      <td className="px-6 py-4"><p className="font-semibold text-navy-900">{emp.full_name}</p></td>
                      <td className="px-6 py-4"><p className="text-sm text-slate-700">{emp.email}</p></td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded ${emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {emp.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-slate-700">{new Date(emp.created_at).toLocaleDateString()}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => resendEmployeeInvite(emp.email)} 
                            className="px-3 py-1.5 text-sm font-semibold text-signal-red hover:text-signal-red/80 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Resend Invite
                          </button>
                          <button 
                            onClick={() => deleteEmployee(emp.id, emp.full_name)} 
                            className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Team Member Form */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Add Team Member</h2>
              <p className="text-sm text-slate-600">Create a new employee account and send invitation</p>
            </div>
            <form onSubmit={createEmployeeAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.fullName} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmployee.email} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Role</label>
                <select 
                  value={newEmployee.role} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none rounded-lg"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={creating} 
                className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 rounded-lg"
              >
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Services & Integrations</h2>
            <p className="text-sm text-slate-600">Manage external services and subscriptions</p>
          </div>
          {[
            { name: 'Supabase', desc: 'Database, Auth & Storage', url: 'https://supabase.com/dashboard', project: 'ie-global-portal' },
            { name: 'Resend', desc: 'Email Service', url: 'https://resend.com/emails', project: 'contact@ie-global.net' },
            { name: 'Vercel', desc: 'Hosting & Deployment', url: 'https://vercel.com/dashboard', project: 'ie-global.net' },
            { name: 'GitHub', desc: 'Source Repository', url: 'https://github.com/cxspectre/ieglobal', project: 'cxspectre/ieglobal' },
          ].map((service) => (
            <a 
              key={service.name} 
              href={service.url} 
              target="_blank" 
              className="block bg-white p-6 hover:bg-gray-50 transition-all duration-200 rounded-lg shadow-sm border border-gray-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-1 group-hover:text-signal-red transition-colors">{service.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{service.desc}</p>
                  <p className="text-xs text-slate-500 font-mono">{service.project}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-signal-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Company Info Tab */}
      {activeTab === 'company' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Company Information</h2>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Legal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Company Name</p>
                <p className="text-lg font-bold text-navy-900">IE Global</p>
              </div>
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">KvK Number</p>
                <p className="text-lg font-bold text-navy-900 font-mono">97185515</p>
              </div>
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">BTW (VAT)</p>
                <p className="text-lg font-bold text-navy-900 font-mono">NL737599054B02</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Banking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">IBAN</p>
                <p className="text-lg font-bold text-navy-900 font-mono">[Add your IBAN]</p>
              </div>
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">BIC/SWIFT</p>
                <p className="text-lg font-bold text-navy-900 font-mono">[Add your BIC]</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Email</p>
                <a href="mailto:hello@ie-global.net" className="text-lg font-bold text-signal-red hover:underline">
                  hello@ie-global.net
                </a>
              </div>
              <div className="p-4 bg-off-white rounded-lg">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Website</p>
                <a href="https://ie-global.net" target="_blank" className="text-lg font-bold text-signal-red hover:underline">
                  ie-global.net
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
