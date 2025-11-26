'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type RevenueData = {
  month: string;
  revenue: number;
  invoices: number;
};

type ClientRevenue = {
  name: string;
  revenue: number;
};

type StatusBreakdown = {
  name: string;
  value: number;
  color: string;
};

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<RevenueData[]>([]);
  const [clientRevenue, setClientRevenue] = useState<ClientRevenue[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const router = useRouter();
  const supabase = createBrowserClient();

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  useEffect(() => {
    checkAuth();
  }, []);

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

      await loadRevenueData();
    } catch (err) {
      console.error('Auth check error:', err);
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      // Get all paid invoices
      const { data: paidInvoicesData } = await (supabase as any)
        .from('invoices')
        .select('*, clients(company_name)')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      // Get all invoices for stats
      const { data: allInvoices } = await (supabase as any)
        .from('invoices')
        .select('amount, status')
        .order('created_at', { ascending: true });

      if (!paidInvoicesData || !allInvoices) {
        setLoading(false);
        return;
      }

      // Calculate total revenue
      const total = paidInvoicesData.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
      setTotalRevenue(total);

      // Calculate pending revenue
      const pending = allInvoices
        .filter((inv: any) => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
      setPendingRevenue(pending);

      // Total invoices
      setTotalInvoices(allInvoices.length);
      setPaidInvoices(paidInvoicesData.length);

      // Monthly revenue data (last 12 months)
      const monthlyMap = new Map<string, { revenue: number; invoices: number }>();
      const now = new Date();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyMap.set(key, { revenue: 0, invoices: 0 });
      }

      // Aggregate paid invoices by month
      paidInvoicesData.forEach((invoice: any) => {
        const date = new Date(invoice.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.revenue += invoice.amount || 0;
          existing.invoices += 1;
        }
      });

      const monthlyArray: RevenueData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        invoices: data.invoices,
      }));

      setMonthlyData(monthlyArray);

      // Client revenue breakdown (top 10)
      const clientMap = new Map<string, number>();
      paidInvoicesData.forEach((invoice: any) => {
        const clientName = invoice.clients?.company_name || 'Unknown';
        const existing = clientMap.get(clientName) || 0;
        clientMap.set(clientName, existing + (invoice.amount || 0));
      });

      const clientArray: ClientRevenue[] = Array.from(clientMap.entries())
        .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setClientRevenue(clientArray);

      // Status breakdown
      const statusMap = new Map<string, number>();
      allInvoices.forEach((invoice: any) => {
        const status = invoice.status || 'unknown';
        const existing = statusMap.get(status) || 0;
        statusMap.set(status, existing + (invoice.amount || 0));
      });

      const statusArray: StatusBreakdown[] = Array.from(statusMap.entries()).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        color: COLORS[index % COLORS.length],
      }));

      setStatusBreakdown(statusArray);

      setLoading(false);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading revenue insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Revenue Insights</h1>
        <p className="text-lg text-slate-700">
          Track revenue trends and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white">
          <p className="text-sm text-white/80 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">€{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-white/70 mt-2">From paid invoices</p>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Total Invoices</p>
          <p className="text-3xl font-bold text-navy-900">{totalInvoices}</p>
          <p className="text-xs text-slate-500 mt-2">{paidInvoices} paid</p>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Pending Revenue</p>
          <p className="text-3xl font-bold text-yellow-600">€{pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-2">Awaiting payment</p>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Average Invoice</p>
          <p className="text-3xl font-bold text-navy-900">
            €{paidInvoices > 0 ? (totalRevenue / paidInvoices).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Per paid invoice</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Monthly Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#5F6B7A"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#5F6B7A"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [`€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Revenue (€)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Clients Revenue */}
        <div className="bg-white p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Top Clients by Revenue</h2>
          {clientRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clientRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  stroke="#5F6B7A"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#5F6B7A"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-slate-500">
              No client revenue data available
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Revenue by Status</h2>
          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-slate-500">
              No status data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Invoices Chart */}
      <div className="bg-white p-8 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Monthly Invoice Count</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#5F6B7A"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#5F6B7A"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
            />
            <Legend />
            <Bar dataKey="invoices" fill="#6366f1" radius={[4, 4, 0, 0]} name="Invoices" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

