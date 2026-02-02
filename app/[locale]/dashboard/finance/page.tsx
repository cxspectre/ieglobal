'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

type Expense = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  category: string | null;
  expense_date: string;
  created_by: string;
  created_at: string;
  status?: string;
  receipt_url?: string;
  receipt_path?: string;
  trip_name?: string;
  cost_type?: string;
  payment_method?: string;
  is_recurring?: boolean;
  billing_cycle?: string;
  next_charge_date?: string;
  profiles: {
    full_name: string;
    email: string;
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

type MonthlyFinancial = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  cash_in: number;
  cash_out: number;
  end_balance: number;
};

type MonthlyRecap = {
  totalRevenue: number;
  netRevenue: number;
  invoicesPaid: number;
  newClients: number;
  topExpense: string;
  topExpenseAmount: number;
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financialDocs, setFinancialDocs] = useState<FinancialDocument[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancial[]>([]);
  const [fixedVsVariable, setFixedVsVariable] = useState<any[]>([]);
  const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    trip_name: '',
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

  const COLORS = ['#3b82f6', '#ef4444'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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

    await loadFinancialData();
  };

  const loadFinancialData = async () => {
    try {
      // Get revenue
      const { data: paidInvoices } = await supabase
        .from('invoices')
        .select('amount, created_at, total_amount')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      const totalRev = paidInvoices?.reduce((sum: number, inv: any) => sum + (inv.total_amount || inv.amount || 0), 0) || 0;
      setTotalRevenue(totalRev);

      // Get expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (expensesData) {
        const creatorIds = [...new Set(expensesData.map((e: any) => e.created_by).filter(Boolean))];
        let profilesMap = new Map();
        
        if (creatorIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', creatorIds);
          
          if (profilesData) {
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }
        
        const expensesWithProfiles = expensesData.map((expense: any) => ({
          ...expense,
          profiles: profilesMap.get(expense.created_by) || null,
        }));
        
        setExpenses(expensesWithProfiles);
        const totalExp = expensesData.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        setTotalExpenses(totalExp);

        // Calculate Fixed vs Variable
        const fixedTotal = expensesData
          .filter((e: any) => e.cost_type === 'fixed')
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        const variableTotal = expensesData
          .filter((e: any) => e.cost_type === 'variable')
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        
        setFixedVsVariable([
          { name: 'Fixed Costs', value: Math.round(fixedTotal * 100) / 100, color: '#3b82f6' },
          { name: 'Variable Costs', value: Math.round(variableTotal * 100) / 100, color: '#ef4444' },
        ]);
      }

      // Load documents
      const { data: docsData } = await (supabase as any)
        .from('financial_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (docsData) setFinancialDocs(docsData);

      // Calculate monthly data
      const monthlyMap = new Map<string, { revenue: number; expenses: number; cash_in: number; cash_out: number }>();
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyMap.set(key, { revenue: 0, expenses: 0, cash_in: 0, cash_out: 0 });
      }

      paidInvoices?.forEach((invoice: any) => {
        const date = new Date(invoice.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          const amount = invoice.total_amount || invoice.amount || 0;
          existing.revenue += amount;
          existing.cash_in += amount;
        }
      });

      expensesData?.forEach((expense: any) => {
        const date = new Date(expense.expense_date);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.expenses += expense.amount || 0;
          existing.cash_out += expense.amount || 0;
        }
      });

      let runningBalance = 0;
      const monthlyArray: MonthlyFinancial[] = Array.from(monthlyMap.entries()).map(([month, data]) => {
        runningBalance += data.cash_in - data.cash_out;
        return {
          month,
          revenue: Math.round(data.revenue * 100) / 100,
          expenses: Math.round(data.expenses * 100) / 100,
          profit: Math.round((data.revenue - data.expenses) * 100) / 100,
          cash_in: Math.round(data.cash_in * 100) / 100,
          cash_out: Math.round(data.cash_out * 100) / 100,
          end_balance: Math.round(runningBalance * 100) / 100,
        };
      });

      setMonthlyData(monthlyArray);

      // Generate monthly recap
      await generateMonthlyRecap();

      setLoading(false);
    } catch (err) {
      console.error('Error loading financial data:', err);
      setLoading(false);
    }
  };

  const generateMonthlyRecap = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const { data: monthInvoices } = await supabase
        .from('invoices')
        .select('amount, total_amount, status')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const paidInvoices = monthInvoices?.filter((inv: any) => inv.status === 'paid') || [];
      const totalRev = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || inv.amount || 0), 0);

      const { data: monthExpenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .gte('expense_date', startOfMonth.toISOString().split('T')[0])
        .lte('expense_date', endOfMonth.toISOString().split('T')[0]);

      const totalExp = monthExpenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
      const netRev = totalRev - totalExp;

      const { data: newClients } = await supabase
        .from('clients')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const expenseByCategory = new Map<string, number>();
      monthExpenses?.forEach((exp: any) => {
        const cat = exp.category || 'Uncategorized';
        expenseByCategory.set(cat, (expenseByCategory.get(cat) || 0) + exp.amount);
      });
      
      let topExpense = 'None';
      let topExpenseAmount = 0;
      expenseByCategory.forEach((amount, category) => {
        if (amount > topExpenseAmount) {
          topExpenseAmount = amount;
          topExpense = category;
        }
      });

      setMonthlyRecap({
        totalRevenue: Math.round(totalRev * 100) / 100,
        netRevenue: Math.round(netRev * 100) / 100,
        invoicesPaid: paidInvoices.length,
        newClients: newClients?.length || 0,
        topExpense,
        topExpenseAmount: Math.round(topExpenseAmount * 100) / 100,
      });
    } catch (err) {
      console.error('Error generating monthly recap:', err);
    }
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
      let receiptPath = null;

      if (selectedReceipt) {
        const fileName = `receipts/${Date.now()}-${selectedReceipt.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('financial-documents')
          .upload(fileName, selectedReceipt, {
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('financial-documents')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
          receiptPath = fileName;
        }
      }

      const { error } = await (supabase as any)
        .from('expenses')
        .insert({
          name: newExpense.name,
          description: newExpense.description || null,
          amount: amount,
          category: newExpense.category || null,
          expense_date: newExpense.expense_date,
          status: newExpense.status || 'draft',
          trip_name: newExpense.trip_name || null,
          cost_type: newExpense.cost_type || 'variable',
          payment_method: newExpense.payment_method || null,
          is_recurring: newExpense.is_recurring || false,
          billing_cycle: newExpense.is_recurring ? (newExpense.billing_cycle || 'monthly') : null,
          next_charge_date: newExpense.is_recurring && newExpense.next_charge_date ? newExpense.next_charge_date : null,
          receipt_url: receiptUrl,
          receipt_path: receiptPath,
          created_by: session.user.id,
        });

      if (error) throw error;

      setNewExpense({
        name: '',
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        trip_name: '',
        cost_type: 'variable',
        payment_method: '',
        is_recurring: false,
        billing_cycle: 'monthly',
        next_charge_date: '',
      });
      setSelectedReceipt(null);
      setShowAddExpense(false);
      await loadFinancialData();
      alert('✅ Expense submitted successfully!');
    } catch (err: any) {
      console.error('Error adding expense:', err);
      alert(`Failed: ${err.message}`);
    } finally {
      setSavingExpense(false);
    }
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

      const fileName = `docs/${Date.now()}-${selectedReceipt.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('financial-documents')
        .upload(fileName, selectedReceipt, {
          cacheControl: '3600',
          upsert: false
        });

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
          tags: tags,
          uploaded_by: session.user.id,
        });

      if (dbError) throw dbError;

      setNewDoc({ name: '', document_type: 'other', tags: '' });
      setSelectedReceipt(null);
      setShowUploadDoc(false);
      await loadFinancialData();
      alert('✅ Document uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(`Failed: ${err.message}`);
    } finally {
      setUploadingDoc(false);
    }
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
      alert('✅ Expense deleted');
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const exportToExcel = () => {
    const headers = ['Date', 'Name', 'Category', 'Amount', 'Type', 'Payment Method'];
    const rows = filteredExpenses.map(exp => [
      exp.expense_date,
      exp.name,
      exp.category || '—',
      exp.amount.toFixed(2),
      exp.is_recurring ? 'Recurring' : 'One-time',
      exp.payment_method || '—',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (monthFilter) {
      const expMonth = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (expMonth !== monthFilter) return false;
    }
    return true;
  });

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

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate burn rate (last 3 months average)
  const now = new Date();
  const last3Months = [];
  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthExpenses = expenses.filter(e => {
      const expDate = new Date(e.expense_date);
      return expDate.getMonth() === monthDate.getMonth() && expDate.getFullYear() === monthDate.getFullYear();
    });
    last3Months.push(monthExpenses.reduce((sum, e) => sum + e.amount, 0));
  }
  const avgBurn = last3Months.reduce((sum, val) => sum + val, 0) / 3;
  const runway = avgBurn > 0 ? (totalRevenue / avgBurn) : 0;

  // This month revenue
  const thisMonthRevenue = monthlyData[monthlyData.length - 1]?.revenue || 0;

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
            <p className="text-lg text-slate-700">Financial overview and expense management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 rounded-lg shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit Expense
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-navy-900 text-navy-900 font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Monthly Recap Card */}
      {monthlyRecap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-lg p-8 mb-8 text-white shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">{currentMonth} Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-white/70 mb-1">Revenue</p>
              <p className="text-3xl font-bold">€{monthlyRecap.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Net Revenue</p>
              <p className="text-3xl font-bold">€{monthlyRecap.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Invoices Paid</p>
              <p className="text-3xl font-bold">{monthlyRecap.invoicesPaid}</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">New Clients</p>
              <p className="text-3xl font-bold">{monthlyRecap.newClients}</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Top Expense</p>
              <p className="text-lg font-semibold">{monthlyRecap.topExpense}</p>
              <p className="text-sm text-white/70">€{monthlyRecap.topExpenseAmount.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Financial Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">€{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">€{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{netProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Profit Margin</p>
          <p className="text-2xl font-bold text-navy-900">{profitMargin}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Burn Rate</p>
          <p className="text-2xl font-bold text-navy-900">€{avgBurn.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">/month avg</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wide font-semibold">Runway</p>
          <p className="text-2xl font-bold text-navy-900">{runway > 0 ? runway.toFixed(1) : '—'}</p>
          <p className="text-xs text-slate-500 mt-1">months</p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recurring Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-1">Recurring Expenses</h2>
                <p className="text-sm text-slate-600">Monthly subscriptions and fixed costs</p>
              </div>
              <button
                onClick={() => {
                  setNewExpense({ ...newExpense, is_recurring: true, cost_type: 'fixed' });
                  setShowAddExpense(true);
                }}
                className="px-4 py-2 bg-signal-red text-white text-sm font-semibold rounded-lg hover:bg-signal-red/90 transition-colors"
              >
                + Add Recurring
              </button>
            </div>

            {expenses.filter(e => e.is_recurring || e.cost_type === 'fixed').length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-slate-600 text-sm">No recurring expenses yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.filter(e => e.is_recurring || e.cost_type === 'fixed').map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900">{expense.name}</p>
                        <p className="text-xs text-slate-600">
                          {expense.payment_method || 'Not specified'}
                          {expense.next_charge_date && ` • Next: ${new Date(expense.next_charge_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">€{expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{expense.billing_cycle || 'monthly'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* All Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900 mb-1">All Expenses</h2>
                <p className="text-sm text-slate-600">Complete expense history</p>
              </div>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
              >
                <option value="">All Months</option>
                {Array.from(new Set(expenses.map(e => new Date(e.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })))).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-600 mb-4">No expenses found</p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90"
                >
                  Submit First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-off-white hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {expense.is_recurring && (
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900">{expense.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {expense.category && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {expense.category}
                            </span>
                          )}
                          <span className="text-xs text-slate-600">
                            {new Date(expense.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {expense.payment_method && (
                            <span className="text-xs text-slate-500">via {expense.payment_method}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold text-red-600">€{expense.amount.toFixed(2)}</p>
                      {expense.receipt_url && (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-signal-red hover:bg-red-50 rounded-lg transition-colors"
                          title="View receipt"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy-900 mb-4">Expense Breakdown</h3>
            {fixedVsVariable.length > 0 && fixedVsVariable.some(f => f.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={fixedVsVariable}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fixedVsVariable.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `€${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-semibold text-navy-900">Fixed</span>
                    <span className="text-sm font-bold text-blue-600">
                      €{fixedVsVariable.find(f => f.name === 'Fixed Costs')?.value.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-semibold text-navy-900">Variable</span>
                    <span className="text-sm font-bold text-red-600">
                      €{fixedVsVariable.find(f => f.name === 'Variable Costs')?.value.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Financial Documents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Documents</h3>
              <button
                onClick={() => setShowUploadDoc(true)}
                className="p-2 text-signal-red hover:bg-red-50 rounded-lg transition-colors"
                title="Upload document"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
            </div>

            {financialDocs.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-slate-600 text-sm">No documents</p>
              </div>
            ) : (
              <div className="space-y-2">
                {financialDocs.slice(0, 5).map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-off-white hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate group-hover:text-signal-red transition-colors">{doc.name}</p>
                      <p className="text-xs text-slate-600 capitalize">{doc.document_type.replace('_', ' ')}</p>
                    </div>
                    <svg className="w-4 h-4 text-signal-red flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
                {financialDocs.length > 5 && (
                  <p className="text-center text-xs text-slate-600 pt-2">+ {financialDocs.length - 5} more</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-navy-900 mb-6">12-Month Cash Flow</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCashOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                formatter={(value: number) => `€${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="cash_in" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorCashIn)" 
                name="Cash In"
              />
              <Area 
                type="monotone" 
                dataKey="cash_out" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorCashOut)" 
                name="Cash Out"
              />
              <Line 
                type="monotone" 
                dataKey="end_balance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', r: 3 }}
                name="Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No cash flow data yet
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
                  <h2 className="text-2xl font-bold text-white">Submit Expense</h2>
                  <p className="text-sm text-white/80 mt-1">Add company expense with receipt</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                  rows={3}
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none resize-none"
                  placeholder="Optional notes"
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
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Category</label>
                  <input
                    type="text"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="e.g., Software, Travel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Payment Method</label>
                  <input
                    type="text"
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                    placeholder="e.g., Business Account"
                  />
                </div>
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
                  Recurring expense (subscription, hosting, etc.)
                </label>
              </div>

              {newExpense.is_recurring && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
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
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Next Charge</label>
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
                <label className="block text-sm font-semibold text-navy-900 mb-2">Upload Receipt</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedReceipt(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 focus:outline-none"
                />
                {selectedReceipt && (
                  <p className="text-sm text-slate-600 mt-2">✓ {selectedReceipt.name}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingExpense ? 'Saving...' : 'Submit Expense'}
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
                  <h2 className="text-2xl font-bold text-white">Upload Document</h2>
                  <p className="text-sm text-white/80 mt-1">Tax returns, contracts, etc.</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                  placeholder="e.g., 2024 Tax Return Q4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Type</label>
                <select
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
                  placeholder="e.g., 2024, Q4, Important"
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
                  <p className="text-sm text-slate-600 mt-2">✓ {selectedReceipt.name}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedReceipt}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg transition-colors disabled:opacity-50"
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
