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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Command Center</h1>
        <p className="text-xl text-slate-700">Services, tools, team & company information</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="flex items-center gap-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'team', label: 'Team Management' },
            { key: 'services', label: 'Services' },
            { key: 'company', label: 'Company Info' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'text-navy-900 border-b-2 border-signal-red'
                  : 'text-slate-700 hover:text-navy-900 border-b-2 border-transparent'
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
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a href="https://supabase.com/dashboard" target="_blank" className="p-4 bg-off-white hover:bg-green-50 border-l-4 border-green-500 transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">Supabase</p>
                <p className="text-xs text-slate-600 group-hover:text-green-700">Open →</p>
              </a>
              
              <a href="https://resend.com/emails" target="_blank" className="p-4 bg-off-white hover:bg-blue-50 border-l-4 border-blue-500 transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">Resend</p>
                <p className="text-xs text-slate-600 group-hover:text-blue-700">Open →</p>
              </a>
              
              <a href="https://vercel.com/dashboard" target="_blank" className="p-4 bg-off-white hover:bg-purple-50 border-l-4 border-purple-500 transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">Vercel</p>
                <p className="text-xs text-slate-600 group-hover:text-purple-700">Open →</p>
              </a>
              
              <a href="https://github.com/cxspectre/ieglobal" target="_blank" className="p-4 bg-off-white hover:bg-gray-50 border-l-4 border-gray-500 transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">GitHub</p>
                <p className="text-xs text-slate-600 group-hover:text-gray-700">Open →</p>
              </a>
              
              <a href="https://ie-global.net" target="_blank" className="p-4 bg-off-white hover:bg-red-50 border-l-4 border-signal-red transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">Website</p>
                <p className="text-xs text-slate-600 group-hover:text-red-700">Open →</p>
              </a>
              
              <Link href="/portal" target="_blank" className="p-4 bg-off-white hover:bg-yellow-50 border-l-4 border-yellow-500 transition-all duration-200 group">
                <p className="font-bold text-navy-900 text-sm">Portal</p>
                <p className="text-xs text-slate-600 group-hover:text-yellow-700">Open →</p>
              </Link>
            </div>
          </div>

          {/* One-Click Actions */}
          <div className="bg-white p-8 border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/clients/new" className="p-4 bg-signal-red text-white hover:bg-signal-red/90 transition-colors duration-200 group">
                <p className="font-bold mb-1">+ New Client</p>
                <p className="text-sm text-white/80">Add client & project</p>
              </Link>
              
              <Link href="/dashboard/settings" className="p-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 group">
                <p className="font-bold mb-1">+ New Team Member</p>
                <p className="text-sm text-white/80">Invite employee</p>
              </Link>
              
              <Link href="/dashboard/clients" className="p-4 bg-off-white hover:bg-gray-100 border border-gray-200 transition-colors duration-200 group">
                <p className="font-bold text-navy-900 mb-1">View All Clients</p>
                <p className="text-sm text-slate-600">Manage accounts →</p>
              </Link>
              
              <Link href="/" className="p-4 bg-off-white hover:bg-gray-100 border border-gray-200 transition-colors duration-200 group">
                <p className="font-bold text-navy-900 mb-1">View Website</p>
                <p className="text-sm text-slate-600">ie-global.net →</p>
              </Link>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-8 border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-slate-700">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
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
          <div className="bg-white p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-navy-900 mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Database', status: systemHealth.database },
                { name: 'Storage', status: systemHealth.storage },
                { name: 'Email', status: systemHealth.email },
              ].map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{system.name}</span>
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
          <div className="bg-white p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Team ({employees.length})</h3>
              <Link href="/dashboard/settings" className="text-sm font-semibold text-signal-red hover:underline">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-slate-600">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold ${
                    emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {emp.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Info Quick Reference */}
          <div className="bg-white p-6 border-l-4 border-navy-900">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Company Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">KvK</p>
                <p className="font-mono font-semibold text-navy-900">97185515</p>
              </div>
              <div>
                <p className="text-slate-600">VAT</p>
                <p className="font-mono font-semibold text-navy-900">NL737599054B02</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
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
          <div className="bg-white p-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Team Directory</h2>
            <table className="w-full">
              <thead className="bg-off-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-navy-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-off-white">
                    <td className="px-6 py-4"><p className="font-semibold text-navy-900">{emp.full_name}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-slate-700">{emp.email}</p></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold ${emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {emp.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm text-slate-700">{new Date(emp.created_at).toLocaleDateString()}</p></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteEmployee(emp.id, emp.full_name)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Team Member Form */}
          <div className="bg-white p-8 border-l-4 border-signal-red">
            <h2 className="text-xl font-bold text-navy-900 mb-6">Add Team Member</h2>
            <form onSubmit={createEmployeeAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                  <input type="text" required value={newEmployee.fullName} onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                  <input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Role</label>
                <select value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={creating} className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {[
            { name: 'Supabase', desc: 'Database, Auth & Storage', url: 'https://supabase.com/dashboard', project: 'ie-global-portal' },
            { name: 'Resend', desc: 'Email Service', url: 'https://resend.com/emails', project: 'contact@ie-global.net' },
            { name: 'Vercel', desc: 'Hosting & Deployment', url: 'https://vercel.com/dashboard', project: 'ie-global.net' },
            { name: 'GitHub', desc: 'Source Repository', url: 'https://github.com/cxspectre/ieglobal', project: 'cxspectre/ieglobal' },
          ].map((service) => (
            <a key={service.name} href={service.url} target="_blank" className="block bg-white p-8 hover:bg-navy-900 transition-all duration-300 border-l-4 border-transparent hover:border-signal-red group">
              <h3 className="text-2xl font-bold text-navy-900 group-hover:text-white mb-2 transition-colors duration-300">{service.name}</h3>
              <p className="text-base text-slate-700 group-hover:text-gray-300 mb-3 transition-colors duration-300">{service.desc}</p>
              <p className="text-sm text-slate-600 group-hover:text-gray-400 transition-colors duration-300">{service.project}</p>
            </a>
          ))}
        </div>
      )}

      {/* Company Info Tab */}
      {activeTab === 'company' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Legal Information</h2>
            <div className="bg-white p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div><p className="text-sm text-slate-700 mb-2">Company Name</p><p className="text-lg font-bold text-navy-900">IE Global</p></div>
                <div><p className="text-sm text-slate-700 mb-2">KvK Number</p><p className="text-lg font-bold text-navy-900 font-mono">97185515</p></div>
                <div><p className="text-sm text-slate-700 mb-2">BTW (VAT)</p><p className="text-lg font-bold text-navy-900 font-mono">NL737599054B02</p></div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Banking</h2>
            <div className="bg-white p-10">
              <div className="space-y-6">
                <div><p className="text-sm text-slate-700 mb-2">IBAN</p><p className="text-lg font-bold text-navy-900 font-mono">[Add your IBAN]</p></div>
                <div><p className="text-sm text-slate-700 mb-2">BIC/SWIFT</p><p className="text-lg font-bold text-navy-900 font-mono">[Add your BIC]</p></div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Contact</h2>
            <div className="bg-white p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><p className="text-sm text-slate-700 mb-2">Email</p><a href="mailto:hello@ie-global.net" className="text-lg font-bold text-signal-red hover:underline">hello@ie-global.net</a></div>
                <div><p className="text-sm text-slate-700 mb-2">Website</p><a href="https://ie-global.net" target="_blank" className="text-lg font-bold text-signal-red hover:underline">ie-global.net</a></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

