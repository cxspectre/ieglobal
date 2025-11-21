'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [newEmployee, setNewEmployee] = useState({ email: '', fullName: '', role: 'employee' });
  const [creating, setCreating] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
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

    setUser({ ...session.user, profile });
    setProfileForm({
      full_name: profile.full_name || '',
      email: session.user.email || '',
    });
  };

  const loadData = async () => {
    const { data: empData } = await (supabase as any)
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'employee'])
      .order('created_at', { ascending: false });

    if (empData) setEmployees(empData);
    setLoading(false);
  };

  const updateProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ full_name: profileForm.full_name })
        .eq('id', user.id);

      if (error) throw error;

      alert('✅ Profile updated successfully');
      await checkAuth();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + err.message);
    }
    setSavingProfile(false);
  };

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/create-employee-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create employee');
      }

      alert(`✅ Employee account created!\n\nInvitation sent to: ${newEmployee.email}`);
      setNewEmployee({ email: '', fullName: '', role: 'employee' });
      await loadData();
    } catch (err: any) {
      console.error('Error creating employee:', err);
      alert('Failed to create employee: ' + err.message);
    }
    setCreating(false);
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete employee');
      }

      alert(`✅ ${employeeName} has been removed`);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-gray-900 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
              <p className="text-sm text-slate-600">Manage your account and team</p>
            </div>
      </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 sticky top-24">
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 rounded-xl ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-signal-red to-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 rounded-xl ${
                    activeTab === 'team'
                      ? 'bg-gradient-to-r from-signal-red to-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Team Management
                  <span className="ml-auto bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">{employees.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 rounded-xl ${
                    activeTab === 'company'
                      ? 'bg-gradient-to-r from-signal-red to-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Info
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-3 rounded-xl ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-signal-red to-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            {/* MY PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-navy-900 mb-6">My Profile</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Role</label>
                      <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user?.profile?.role === 'admin' 
                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        }`}>
                          {user?.profile?.role?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={updateProfile}
                      disabled={savingProfile}
                      className="px-6 py-3 bg-gradient-to-r from-signal-red to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
            </div>
          </div>

                {/* Password Change */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-navy-900 mb-4">Change Password</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    To change your password, sign out and use the "Forgot Password" link on the login page.
                  </p>
                  <button
                    onClick={() => router.push('/reset-password')}
                    className="px-6 py-3 bg-gray-100 text-navy-900 font-semibold rounded-full hover:bg-gray-200 transition-all duration-200"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            )}

            {/* TEAM MANAGEMENT TAB */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Add New Employee */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-navy-900 mb-6">Add Team Member</h2>
                  <form onSubmit={createEmployee} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.fullName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Role</label>
                      <select
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={creating}
                      className="px-6 py-3 bg-gradient-to-r from-signal-red to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {creating ? 'Creating Account...' : 'Send Invitation'}
                    </button>
                  </form>
                </div>

                {/* Team Members List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-navy-900 mb-6">Team Members ({employees.length})</h2>
                  
                  {employees.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No team members yet</p>
            ) : (
              <div className="space-y-3">
                      {employees.map((emp) => (
                        <div key={emp.id} className="p-5 rounded-xl bg-gradient-to-r from-slate-50 to-gray-100 border border-gray-200">
                          <div className="flex items-center justify-between">
                    <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-bold text-navy-900">{emp.full_name}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  emp.role === 'admin' 
                                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                                }`}>
                                  {emp.role.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${emp.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  <span className="text-xs text-slate-500">{emp.active ? 'Active' : 'Inactive'}</span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600">{emp.email}</p>
                      <p className="text-xs text-slate-500 mt-1">
                                Joined {new Date(emp.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                            </div>
                            {emp.id !== user.id && user?.profile?.role === 'admin' && (
                              <button
                                onClick={() => deleteEmployee(emp.id, emp.full_name)}
                                className="ml-4 px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200"
                              >
                                Remove
                              </button>
                            )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
            )}

            {/* COMPANY INFO TAB */}
            {activeTab === 'company' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Company Information</h2>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Company Name</p>
                    <p className="text-xl font-bold text-navy-900">IE Global</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                      <p className="text-sm font-semibold text-slate-600 mb-2">KvK Number</p>
                      <p className="text-lg font-mono font-bold text-navy-900">97185515</p>
                </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                      <p className="text-sm font-semibold text-slate-600 mb-2">VAT Number</p>
                      <p className="text-lg font-mono font-bold text-navy-900">NL737599054B02</p>
            </div>
          </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Registered Address</p>
                    <div className="text-slate-700 space-y-1">
                      <p>ODER 20 Box 66193</p>
                      <p>2491DC Den Haag</p>
                      <p>Netherlands</p>
            </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Contact Information</p>
                    <div className="space-y-2">
                      <a href="mailto:hello@ie-global.net" className="block font-semibold text-signal-red hover:underline">
                        hello@ie-global.net
                      </a>
                      <a href="tel:+31627207108" className="block font-semibold text-signal-red hover:underline">
                        +31 6 27 20 71 08
                      </a>
            </div>
          </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Banking Details</p>
                    <div className="space-y-1 text-slate-700">
                      <p><span className="font-semibold">Bank:</span> BUNQ</p>
                      <p><span className="font-semibold">IBAN:</span> NL50 BUNQ 2152 5367 38</p>
                      <p><span className="font-semibold">BIC:</span> BUNQNL2A</p>
            </div>
          </div>
        </div>
      </div>
      )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-navy-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Active Sessions */}
                <div>
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Active Session</h3>
                      <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                </div>
                <div>
                            <p className="font-semibold text-navy-900">Current Browser Session</p>
                            <p className="text-sm text-slate-600">Logged in as {user?.email}</p>
                </div>
              </div>
          </div>
        </div>

                    {/* Password */}
          <div>
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Password</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Update your password to keep your account secure
                      </p>
                      <button
                        onClick={() => router.push('/reset-password')}
                        className="px-6 py-3 bg-gray-100 text-navy-900 font-semibold rounded-full hover:bg-gray-200 transition-all duration-200"
                      >
                        Change Password
                      </button>
              </div>

                    {/* Sign Out */}
          <div>
                      <h3 className="text-lg font-bold text-navy-900 mb-3">Sign Out</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Sign out of your account on this device
                      </p>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          router.push('/login');
                        }}
                        className="px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-full hover:bg-red-200 transition-all duration-200"
                      >
                        Sign Out
                      </button>
              </div>
            </div>
          </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
