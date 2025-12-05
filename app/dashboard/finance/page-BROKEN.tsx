'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';

type Expense = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  category: string | null;
  expense_date: string;
  status: string;
  receipt_url: string | null;
  cost_type: string | null;
  payment_method: string | null;
  is_recurring: boolean;
  billing_cycle: string | null;
  next_charge_date: string | null;
  profiles: {
    full_name: string;
  } | null;
};

type FinancialDocument = {
  id: string;
  name: string;
  document_type: string;
  file_url: string;
  tags: string[];
  created_at: string;
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  const [thisMonthExpenses, setThisMonthExpenses] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financialDocs, setFinancialDocs] = useState<FinancialDocument[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [fixedVsVariable, setFixedVsVariable] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);
  const [monthFilter, setMonthFilter] = useState('');
  const [newExpense, setNewExpense] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    status: 'paid',
    cost_type: 'variable',
    payment_method: '',
    is_recurring: false,
    billing_cycle: 'monthly',
    next_charge_date: '',
  });
  const [newDoc, setNewDoc] = useState({
    name: '',
    document_type: 'other',
    tags: '',
  });
  
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
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
      router.push('/dashboard');
      return;
    }

    // Load revenue
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('amount, created_at, paid_date')
      .eq('status', 'paid');

    const totalRev = paidInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    setTotalRevenue(totalRev);

    // This month revenue
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthRev = paidInvoices?.filter(inv => 
      new Date(inv.paid_date || inv.created_at) >= startOfMonth
    ).reduce((sum, inv) => sum + inv.amount, 0) || 0;
    setThisMonthRevenue(monthRev);

    // Load expenses
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*, profiles(full_name)')
      .order('expense_date', { ascending: false });

    if (expensesData) {
      setExpenses(expensesData as any);
      const totalExp = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
      setTotalExpenses(totalExp);

      // This month expenses
      const monthExp = expensesData.filter(exp => 
        new Date(exp.expense_date) >= startOfMonth
      ).reduce((sum, exp) => sum + exp.amount, 0);
      setThisMonthExpenses(monthExp);

      // Fixed vs Variable
      const fixed = expensesData.filter(e => e.cost_type === 'fixed').reduce((sum, e) => sum + e.amount, 0);
      const variable = expensesData.filter(e => e.cost_type === 'variable' || !e.cost_type).reduce((sum, e) => sum + e.amount, 0);
      setFixedVsVariable([
        { name: 'Fixed Costs', value: fixed, color: '#3b82f6' },
        { name: 'Variable Costs', value: variable, color: '#ef4444' },
      ]);

      // Monthly data (last 12 months)
      const monthlyMap = new Map();
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'yy' });
        monthlyMap.set(key, { revenue: 0, expenses: 0, cash_in: 0, cash_out: 0 });
      }

      paidInvoices?.forEach(inv => {
        const key = new Date(inv.paid_date || inv.created_at).toLocaleDateString('en-US', { month: 'short', year: 'yy' });
        if (monthlyMap.has(key)) {
          const data = monthlyMap.get(key);
          data.revenue += inv.amount;
          data.cash_in += inv.amount;
        }
      });

      expensesData.forEach(exp => {
        const key = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'yy' });
        if (monthlyMap.has(key)) {
          const data = monthlyMap.get(key);
          data.expenses += exp.amount;
          data.cash_out += exp.amount;
        }
      });

      let runningBalance = 0;
      const monthlyArray = Array.from(monthlyMap.entries()).map(([month, data]) => {
        runningBalance += data.cash_in - data.cash_out;
        return {
          month,
          revenue: Math.round(data.revenue * 100) / 100,
          expenses: Math.round(data.expenses * 100) / 100,
          profit: Math.round((data.revenue - data.expenses) * 100) / 100,
          cash_in: Math.round(data.cash_in * 100) / 100,
          cash_out: Math.round(data.cash_out * 100) / 100,
          balance: Math.round(runningBalance * 100) / 100,
        };
      });

      setMonthlyData(monthlyArray);
    }

    // Load financial documents
    const { data: docsData } = await (supabase as any)
      .from('financial_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docsData) {
      setFinancialDocs(docsData);
    }

    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExpense(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        setSavingExpense(false);
        return;
      }

      let receiptUrl = null;
      if (selectedReceipt) {
        const fileName = `receipts/${Date.now()}-${selectedReceipt.name}`;
        const { error: uploadError } = await supabase.storage
          .from('financial-documents')
          .upload(fileName, selectedReceipt);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('financial-documents')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
        }
      }

      const { error } = await (supabase as any)
        .from('expenses')
        .insert({
          name: newExpense.name,
          description: newExpense.description || null,
          amount,
          category: newExpense.category || null,
          expense_date: newExpense.expense_date,
          status: newExpense.status,
          cost_type: newExpense.cost_type,
          payment_method: newExpense.payment_method || null,
          is_recurring: newExpense.is_recurring,
          billing_cycle: newExpense.is_recurring ? newExpense.billing_cycle : null,
          next_charge_date: newExpense.is_recurring && newExpense.next_charge_date ? newExpense.next_charge_date : null,
          receipt_url: receiptUrl,
          created_by: session.user.id,
        });

      if (error) throw error;

      setNewExpense({
        name: '',
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        cost_type: 'variable',
        payment_method: '',
        is_recurring: false,
        billing_cycle: 'monthly',
        next_charge_date: '',
      });
      setSelectedReceipt(null);
      setShowAddExpense(false);
      await loadFinancialData();
      alert('✅ Expense added successfully!');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setSavingExpense(false);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt) {
      alert('Please select a file');
      return;
    }

    setUploadingDoc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileName = `docs/${Date.now()}-${selectedReceipt.name}`;
      const { error: uploadError } = await supabase.storage
        .from('financial-documents')
        .upload(fileName, selectedReceipt);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('financial-documents')
        .getPublicUrl(fileName);

      const tags = newDoc.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { error: dbError } = await (supabase as any)
        .from('financial_documents')
        .insert({
          name: newDoc.name,
          document_type: newDoc.document_type,
          file_url: publicUrl,
          file_path: fileName,
          file_size: selectedReceipt.size,
          tags,
          uploaded_by: session.user.id,
        });

      if (dbError) throw dbError;

      setNewDoc({ name: '', document_type: 'other', tags: '' });
      setSelectedReceipt(null);
      setShowUploadDoc(false);
      await loadFinancialData();
      alert('✅ Document uploaded!');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
    setUploadingDoc(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('⚠️ Delete this expense?')) return;

    try {
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      await loadFinancialData();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const exportToExcel = (filteredExpenses: Expense[]) => {
    const headers = ['Date', 'Name', 'Category', 'Amount', 'Type', 'Status', 'Payment Method'];
    const rows = filteredExpenses.map(exp => [
      exp.expense_date,
      exp.name,
      exp.category || '—',
      exp.amount.toFixed(2),
      exp.is_recurring ? 'Recurring' : 'One-time',
      exp.status,
      exp.payment_method || '—',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ie-global-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading financial data...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const thisMonthProfit = thisMonthRevenue - thisMonthExpenses;
  
  const recurringExpenses = expenses.filter(e => e.is_recurring || e.cost_type === 'fixed');
  const monthlyBurn = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const expDate = new Date(e.expense_date);
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
  const lastMonthExpenses = expenses.filter(e => {
    const expDate = new Date(e.expense_date);
    return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear();
  });
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthOverMonth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysVariable = expenses.filter(e => {
    const expDate = new Date(e.expense_date);
    return expDate >= thirtyDaysAgo && (e.cost_type === 'variable' || !e.cost_type);
  });
  const variableLast30Days = last30DaysVariable.reduce((sum, e) => sum + e.amount, 0);
  
  const last3MonthsData: number[] = [];
  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthExpenses = expenses.filter(e => {
      const expDate = new Date(e.expense_date);
      return expDate.getMonth() === monthDate.getMonth() && expDate.getFullYear() === monthDate.getFullYear();
    });
    last3MonthsData.push(monthExpenses.reduce((sum, e) => sum + e.amount, 0));
  }
  const avgBurnRate = last3MonthsData.reduce((sum, val) => sum + val, 0) / 3;
  const runway = avgBurnRate > 0 ? (totalRevenue / avgBurnRate) : 0;

  const filteredExpenses = monthFilter
    ? expenses.filter(e => {
        const expMonth = new Date(e.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return expMonth === monthFilter;
      })
    : expenses;

  const availableMonths: string[] = [];
  expenses.forEach(e => {
    const month = new Date(e.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!availableMonths.includes(month)) {
      availableMonths.push(month);
    }
  });
  availableMonths.sort().reverse();

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-1">Finance & Expenses</h1>
            <p className="text-lg text-slate-700">Complete financial overview and expense tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 rounded-lg shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
            <button
              onClick={() => setShowUploadDoc(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white font-semibold hover:bg-navy-800 transition-all duration-200 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Doc
            </button>
            <button
              onClick={() => exportToExcel(filteredExpenses)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-navy-900 font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Monthly Recap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl p-8 mb-8 text-white shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-white/70 mb-1">Revenue</p>
            <p className="text-3xl font-bold">€{thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Expenses</p>
            <p className="text-3xl font-bold">€{thisMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className={`text-xs font-semibold mt-1 ${monthOverMonth >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {monthOverMonth >= 0 ? '+' : ''}{monthOverMonth.toFixed(1)}% vs last month
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${thisMonthProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              €{thisMonthProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Recurring</p>
            <p className="text-3xl font-bold text-orange-400">€{monthlyBurn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-white/70 mt-1">{recurringExpenses.length} subscriptions</p>
          </div>
        </div>
      </motion.div>

      {/* Advanced Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">€{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">All-time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">€{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} expenses</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">{profitMargin}% margin</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Variable (30d)</p>
          <p className="text-2xl font-bold text-navy-900">€{variableLast30Days.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{last30DaysVariable.length} one-time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Burn Rate</p>
          <p className="text-2xl font-bold text-orange-600">€{avgBurnRate.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Avg/month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Runway</p>
          <p className="text-2xl font-bold text-navy-900">{runway > 0 ? runway.toFixed(1) : '—'}</p>
          <p className="text-xs text-slate-500 mt-1">months</p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue vs Expenses & Cash Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">Cash Flow (Last 12 Months)</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#5F6B7A" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#5F6B7A" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cash_in" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Cash In" />
                  <Area type="monotone" dataKey="cash_out" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Cash Out" />
                  <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#3b82f6', r: 3 }} name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-slate-500">
                No data yet - add expenses and invoices to see your cash flow
              </div>
            )}
          </motion.div>

          {/* Fixed vs Variable */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6">Expense Breakdown: Fixed vs Variable</h2>
            {fixedVsVariable.length > 0 && fixedVsVariable.some(f => f.value > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={fixedVsVariable}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {fixedVsVariable.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  {fixedVsVariable.map((item) => (
                    <div key={item.name} className="p-4 bg-off-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                        <p className="font-semibold text-navy-900">{item.name}</p>
                      </div>
                      <p className="text-2xl font-bold text-navy-900">€{item.value.toFixed(2)}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0}% of total
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">
                No expense data yet - add expenses to see breakdown
              </div>
            )}
          </motion.div>
        </div>

        {/* Recurring Expenses Sidebar (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Recurring Expenses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-navy-900 mb-1">Recurring Expenses</h2>
              <p className="text-sm text-slate-600">{recurringExpenses.length} subscriptions</p>
            </div>

            {recurringExpenses.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-xs text-slate-600">No recurring expenses</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recurringExpenses.map((expense) => (
                  <div key={expense.id} className="p-3 bg-off-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <p className="font-semibold text-navy-900 text-sm truncate">{expense.name}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-1 transition-all flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {expense.category && (
                      <p className="text-xs text-slate-600 mb-2">{expense.category}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-red-600">€{expense.amount.toFixed(2)}</p>
                      <span className="text-xs text-slate-600">/{expense.billing_cycle === 'annual' ? 'yr' : 'mo'}</span>
                    </div>
                    {expense.next_charge_date && (
                      <p className="text-xs text-slate-500 mt-2">
                        Next: {new Date(expense.next_charge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900 mb-1">Documents</h2>
                <p className="text-sm text-slate-600">{financialDocs.length} files</p>
              </div>
              <button
                onClick={() => setShowUploadDoc(true)}
                className="p-2 text-signal-red hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {financialDocs.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-xs text-slate-600">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {financialDocs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group"
                  >
                    <p className="font-semibold text-navy-900 text-sm truncate group-hover:text-signal-red transition-colors">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">{doc.document_type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* All Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900">All Expenses ({expenses.length})</h2>
          {availableMonths.length > 0 && (
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
            >
              <option value="">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          )}
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg text-slate-700 mb-2 font-semibold">No expenses yet</p>
            <p className="text-sm text-slate-600 mb-6">Track company expenses, subscriptions, and costs</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 rounded-lg"
            >
              Submit Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {expense.is_recurring && (
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-navy-900">{expense.name}</p>
                      {expense.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {expense.category}
                        </span>
                      )}
                      {expense.is_recurring && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                          RECURRING
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>{new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {expense.payment_method && (
                        <>
                          <span>•</span>
                          <span>{expense.payment_method}</span>
                        </>
                      )}
                      {expense.profiles && (
                        <>
                          <span>•</span>
                          <span>by {expense.profiles.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">€{expense.amount.toFixed(2)}</p>
                    {expense.receipt_url && (
                      <a
                        href={expense.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-signal-red hover:underline"
                      >
                        View Receipt
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
                  <p className="text-sm text-white/80 mt-1">Track company expenses and receipts</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Expense Name <span className="text-signal-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  placeholder="e.g., Supabase Subscription, Office Supplies"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Description</label>
                <textarea
                  rows={2}
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none resize-none"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">
                    Amount (€) <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Date</label>
                  <input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Category</label>
                  <input
                    type="text"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="e.g., Software, Hosting, Office"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Type</label>
                  <select
                    value={newExpense.cost_type}
                    onChange={(e) => setNewExpense({ ...newExpense, cost_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  >
                    <option value="variable">Variable (One-time)</option>
                    <option value="fixed">Fixed (Recurring)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Payment Method</label>
                <input
                  type="text"
                  value={newExpense.payment_method}
                  onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  placeholder="e.g., Business Account, Credit Card"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-off-white rounded-lg">
                <input
                  type="checkbox"
                  id="is-recurring"
                  checked={newExpense.is_recurring}
                  onChange={(e) => setNewExpense({ ...newExpense, is_recurring: e.target.checked })}
                  className="w-5 h-5 text-signal-red border-gray-300 rounded focus:ring-signal-red"
                />
                <label htmlFor="is-recurring" className="text-sm font-semibold text-navy-900">
                  This is a recurring expense (subscription/monthly service)
                </label>
              </div>

              {newExpense.is_recurring && (
                <div className="grid grid-cols-2 gap-4 pl-6 border-l-4 border-orange-500">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Billing Cycle</label>
                    <select
                      value={newExpense.billing_cycle}
                      onChange={(e) => setNewExpense({ ...newExpense, billing_cycle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Next Charge Date</label>
                    <input
                      type="date"
                      value={newExpense.next_charge_date}
                      onChange={(e) => setNewExpense({ ...newExpense, next_charge_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Upload Receipt (Optional)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedReceipt(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                />
                {selectedReceipt && (
                  <p className="text-sm text-slate-600 mt-2">Selected: {selectedReceipt.name}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg transition-all disabled:opacity-50"
                >
                  {savingExpense ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload Financial Document</h2>
                  <p className="text-sm text-white/80 mt-1">Tax returns, contracts, agreements</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadDocument} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Document Name <span className="text-signal-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  placeholder="e.g., 2024 Tax Return, Q1 Bank Statement"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Document Type <span className="text-signal-red">*</span>
                </label>
                <select
                  required
                  value={newDoc.document_type}
                  onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                >
                  <option value="tax_return">Tax Return</option>
                  <option value="contract">Contract</option>
                  <option value="financial_agreement">Financial Agreement</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  placeholder="e.g., 2024, Q1, Important"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  File <span className="text-signal-red">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setSelectedReceipt(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                />
                {selectedReceipt && (
                  <p className="text-sm text-slate-600 mt-2">Selected: {selectedReceipt.name}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedReceipt}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg transition-all disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
