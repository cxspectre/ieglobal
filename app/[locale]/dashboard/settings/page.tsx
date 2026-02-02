'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy' });
  const [newEmployee, setNewEmployee] = useState({ email: '', fullName: '', role: 'employee' });
  const [creating, setCreating] = useState(false);
  
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

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
      return;
    }

    // Load employees
    const { data: empData } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'employee'])
      .order('created_at', { ascending: false });
    
    if (empData) setEmployees(empData);

    // Load activity
    const { data: actData } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    
    if (actData) setRecentActivity(actData);

    // Check system health
    try {
      await supabase.from('clients').select('id').limit(1);
      await supabase.storage.listBuckets();
      setSystemHealth({ database: 'healthy', storage: 'healthy' });
    } catch {
      setSystemHealth({ database: 'error', storage: 'error' });
    }

    setLoading(false);
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

      alert(`✅ Employee account created!\n\nInvitation sent to: ${newEmployee.email}`);
      setNewEmployee({ email: '', fullName: '', role: 'employee' });
      await loadData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setCreating(false);
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`⚠️ Delete ${employeeName}?\n\nThis will remove their dashboard access.`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert(`✅ ${employeeName} has been removed.`);
      await loadData();
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
        alert(`✅ Invitation resent to ${email}!\n\nBackup link:\n${result.invitationLink}`);
      } else {
        alert(`✅ Invitation resent to ${email}`);
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
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
      <div className="flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-1">Settings & Admin</h1>
            <p className="text-lg text-slate-700">Manage team, services, and company information</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-semibold ${
              systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              {systemHealth.database === 'healthy' && systemHealth.storage === 'healthy'
                ? 'All Systems Operational'
                : 'System Issues Detected'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Modern Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-2"
      >
        <div className="flex items-center gap-2">
          {[
            { key: 'team', label: 'Team Management', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { key: 'services', label: 'External Services', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { key: 'company', label: 'Company Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { key: 'activity', label: 'Activity Log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-signal-red text-white shadow-md'
                  : 'text-slate-700 hover:bg-off-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Team Management Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Add Team Member */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Add Team Member</h2>
            <form onSubmit={createEmployeeAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newEmployee.fullName} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={newEmployee.email} 
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="john@ie-global.net"
                  />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Role</label>
                <select 
                  value={newEmployee.role} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={creating} 
                className="inline-flex items-center gap-2 px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50 rounded-lg shadow-md"
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Create Account & Send Invite</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Team Directory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Team Directory ({employees.length})</h2>
            
            {employees.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-600">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-5 bg-off-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-navy-900 to-navy-800 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {emp.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 text-lg">{emp.full_name}</p>
                        <p className="text-sm text-slate-600">{emp.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Joined {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 text-sm font-bold rounded-lg flex-shrink-0 ${
                        emp.role === 'admin'
                          ? 'bg-red-100 text-red-800 border-2 border-red-200'
                          : 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      }`}>
                        {emp.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => resendEmployeeInvite(emp.email)}
                        className="px-4 py-2 text-sm font-semibold text-signal-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Resend invitation"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => deleteEmployee(emp.id, emp.full_name)}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove team member"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
          </div>
            )}
          </motion.div>
        </div>
      )}

      {/* External Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-navy-900 mb-6">External Services & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
                {
                  name: 'Supabase',
                  desc: 'Database, Authentication & Storage',
                  url: 'https://supabase.com/dashboard',
                  project: 'ie-global-portal',
                  color: 'green',
                  icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
                },
                {
                  name: 'Resend',
                  desc: 'Email Delivery Service',
                  url: 'https://resend.com/emails',
                  project: 'contact@ie-global.net',
                  color: 'blue',
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                },
                {
                  name: 'Vercel',
                  desc: 'Hosting & Deployment Platform',
                  url: 'https://vercel.com/dashboard',
                  project: 'ie-global.net',
                  color: 'purple',
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z'
                },
                {
                  name: 'GitHub',
                  desc: 'Source Code Repository',
                  url: 'https://github.com/cxspectre/ieglobal',
                  project: 'cxspectre/ieglobal',
                  color: 'gray',
                  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                },
          ].map((service) => (
            <a 
              key={service.name} 
              href={service.url} 
              target="_blank" 
                  rel="noopener noreferrer"
                  className="p-6 bg-off-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-signal-red transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 bg-${service.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-signal-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-1 group-hover:text-signal-red transition-colors">{service.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{service.desc}</p>
                  <p className="text-xs text-slate-500 font-mono">{service.project}</p>
            </a>
          ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Company Info Tab */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Company Information</h2>
            
            {/* Legal Information */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">Legal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Company Name</p>
                  <p className="text-xl font-bold text-navy-900">IE Global</p>
              </div>
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">KvK Number</p>
                  <p className="text-xl font-bold text-navy-900 font-mono">97185515</p>
              </div>
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">BTW (VAT)</p>
                  <p className="text-xl font-bold text-navy-900 font-mono">NL737599054B02</p>
              </div>
            </div>
          </div>

            {/* Banking Information */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">IBAN</p>
                <p className="text-lg font-bold text-navy-900 font-mono">[Add your IBAN]</p>
              </div>
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">BIC/SWIFT</p>
                <p className="text-lg font-bold text-navy-900 font-mono">[Add your BIC]</p>
              </div>
            </div>
          </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Email</p>
                <a href="mailto:hello@ie-global.net" className="text-lg font-bold text-signal-red hover:underline">
                  hello@ie-global.net
                </a>
              </div>
                <div className="p-5 bg-off-white rounded-lg border border-gray-200">
                <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Website</p>
                  <a href="https://ie-global.net" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-signal-red hover:underline">
                  ie-global.net
                </a>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Activity Log</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-slate-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-signal-red rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
