'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Client = {
  id: string;
  company_name: string;
  contact_person: string;
  contact_email: string;
  industry: string | null;
  status: string;
  created_at: string;
};

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuthAndLoadClients = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Load clients
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading clients:', error);
      } else {
        setClients(data || []);
      }
      
      setLoading(false);
    };

    checkAuthAndLoadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">Clients</h1>
              <p className="text-slate-700">Manage all your client accounts and projects</p>
            </div>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Client</span>
            </Link>
          </div>

          {/* Search */}
          <div className="bg-white p-4 mb-6">
            <input
              type="text"
              placeholder="Search clients by name, person, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900"
            />
          </div>

          {/* Clients List */}
          {filteredClients.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-slate-700 mb-6">
                {search ? 'No clients match your search.' : 'No clients yet. Add your first client to get started!'}
              </p>
              {!search && (
                <Link
                  href="/dashboard/clients/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
                >
                  <span>Add Your First Client</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-off-white border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-navy-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-off-white transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-navy-900">{client.company_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">{client.contact_person}</div>
                          <div className="text-xs text-slate-500">{client.contact_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">{client.industry || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="text-sm font-semibold text-signal-red hover:text-signal-red/80 transition-colors duration-200"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
    </div>
  );
}

