'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({ email: '', fullName: '', role: 'employee' });
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    checkAuth();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .in('role', ['admin', 'employee'])
      .order('created_at', { ascending: false });

    if (data) setEmployees(data);
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'employee') {
        router.push('/portal');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Auth check error:', err);
      setLoading(false);
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

      alert(`Employee account created successfully.\n\nInvitation sent to: ${newEmployee.email}`);
      setNewEmployee({ email: '', fullName: '', role: 'employee' });
      await loadEmployees();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setCreating(false);
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Delete ${employeeName}? This will remove their access to the dashboard.`)) {
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
      await loadEmployees();
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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-navy-900 mb-8">Settings</h1>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="flex items-center gap-8 overflow-x-auto">
          {[
            { key: 'services', label: 'Services' },
            { key: 'team', label: 'Team' },
            { key: 'company', label: 'Company' },
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

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-1">
          {[
            { name: 'Supabase', desc: 'Database, Authentication & Storage', url: 'https://supabase.com/dashboard', project: 'ie-global-portal', status: 'Active' },
            { name: 'Resend', desc: 'Email Delivery Service', url: 'https://resend.com/emails', project: 'contact@ie-global.net', status: 'Active' },
            { name: 'Vercel', desc: 'Hosting, Deployment & Analytics', url: 'https://vercel.com/dashboard', project: 'ie-global.net', status: 'Active' },
            { name: 'GitHub', desc: 'Source Code Repository', url: 'https://github.com/cxspectre/ieglobal', project: 'cxspectre/ieglobal', status: 'Active' },
          ].map((service) => (
            <a
              key={service.name}
              href={service.url}
              target="_blank"
              className="block bg-white p-8 hover:bg-navy-900 transition-all duration-300 border-l-4 border-transparent hover:border-signal-red group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-navy-900 group-hover:text-white mb-2 transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-base text-slate-700 group-hover:text-gray-300 mb-3 transition-colors duration-300">
                    {service.desc}
                  </p>
                  <p className="text-sm text-slate-600 group-hover:text-gray-400 transition-colors duration-300">
                    {service.project}
                  </p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 text-xs font-semibold">
                  {service.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-8">
          {/* Employee Directory */}
          <div>
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Team Directory</h2>
            
            {employees.length > 0 && (
              <div className="bg-white mb-8">
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
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-off-white">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-navy-900">{employee.full_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{employee.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold ${
                            employee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {employee.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">
                            {new Date(employee.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteEmployee(employee.id, employee.full_name)}
                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Team Member */}
          <div>
            <h2 className="text-xl font-bold text-navy-900 mb-6">Add Team Member</h2>
            <div className="bg-white p-10 border-l-4 border-signal-red">
              <form onSubmit={createEmployeeAccount} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.fullName}
                      onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Access Level</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-8 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Legal Information</h2>
            <div className="bg-white p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm text-slate-700 mb-2">Company Name</p>
                  <p className="text-lg font-bold text-navy-900">IE Global</p>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">KvK Number</p>
                  <p className="text-lg font-bold text-navy-900 font-mono">97185515</p>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">BTW (VAT)</p>
                  <p className="text-lg font-bold text-navy-900 font-mono">NL737599054B02</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Banking Information</h2>
            <div className="bg-white p-10">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-700 mb-2">IBAN</p>
                  <p className="text-lg font-bold text-navy-900 font-mono">[Add your IBAN]</p>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">BIC/SWIFT</p>
                  <p className="text-lg font-bold text-navy-900 font-mono">[Add your BIC]</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">Contact Information</h2>
            <div className="bg-white p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-700 mb-2">Email</p>
                  <a href="mailto:hello@ie-global.net" className="text-lg font-bold text-signal-red hover:underline">
                    hello@ie-global.net
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">Website</p>
                  <a href="https://ie-global.net" target="_blank" className="text-lg font-bold text-signal-red hover:underline">
                    ie-global.net
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
