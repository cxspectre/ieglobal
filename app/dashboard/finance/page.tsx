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
  AreaChart,
  Area,
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
  reimbursement_amount?: number;
  reimbursement_date?: string;
  expected_payment_date?: string;
  cost_type?: string;
  payment_method?: string;
  is_recurring?: boolean;
  billing_cycle?: string;
  next_charge_date?: string;
  is_reimbursed?: boolean;
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
  bestService: string;
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financialDocs, setFinancialDocs] = useState<FinancialDocument[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancial[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [fixedVsVariable, setFixedVsVariable] = useState<any[]>([]);
  const [monthlyRecap, setMonthlyRecap] = useState<MonthlyRecap | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'recurring' | 'one-time'>('all');
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

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

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

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await loadFinancialData();
    } catch (err) {
      console.error('Auth check error:', err);
      setLoading(false);
    }
  };

  const loadFinancialData = async () => {
    try {
      // Get all paid invoices for revenue
      const { data: paidInvoices } = await (supabase as any)
        .from('invoices')
        .select('amount, created_at, total_amount')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      const totalRev = paidInvoices?.reduce((sum: number, inv: any) => sum + (inv.total_amount || inv.amount || 0), 0) || 0;
      setTotalRevenue(totalRev);

      // Get all expenses
      const { data: expensesData } = await (supabase as any)
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (expensesData) {
        // Get creator profiles separately
        const creatorIds = [...new Set(expensesData.map((e: any) => e.created_by).filter(Boolean))];
        let profilesMap = new Map();
        
        if (creatorIds.length > 0) {
          const { data: profilesData } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, email')
            .in('id', creatorIds);
          
          if (profilesData) {
            profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
          }
        }
        
        // Map profiles to expenses
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

      // Load financial documents
      const { data: docsData } = await (supabase as any)
        .from('financial_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (docsData) {
        setFinancialDocs(docsData);
      }

      // Calculate monthly financial data (last 12 months)
      const monthlyMap = new Map<string, { revenue: number; expenses: number; cash_in: number; cash_out: number }>();
      const now = new Date();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyMap.set(key, { revenue: 0, expenses: 0, cash_in: 0, cash_out: 0 });
      }

      // Aggregate revenue by month
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

      // Aggregate expenses by month
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

      // Category breakdown
      const categoryMap = new Map<string, number>();
      expensesData?.forEach((expense: any) => {
        const category = expense.category || 'Uncategorized';
        const existing = categoryMap.get(category) || 0;
        categoryMap.set(category, existing + (expense.amount || 0));
      });

      const categoryArray = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: COLORS[index % COLORS.length],
      }));

      setCategoryBreakdown(categoryArray);

      // Generate monthly recap (current month)
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

      // Get current month invoices
      const { data: monthInvoices } = await (supabase as any)
        .from('invoices')
        .select('amount, total_amount, status')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      const paidInvoices = monthInvoices?.filter((inv: any) => inv.status === 'paid') || [];
      const totalRev = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || inv.amount || 0), 0);

      // Get current month expenses
      const { data: monthExpenses } = await (supabase as any)
        .from('expenses')
        .select('amount, category')
        .gte('expense_date', startOfMonth.toISOString().split('T')[0])
        .lte('expense_date', endOfMonth.toISOString().split('T')[0]);

      const totalExp = monthExpenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
      const netRev = totalRev - totalExp;

      // Get new clients this month
      const { data: newClients } = await (supabase as any)
        .from('clients')
        .select('id')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      // Find top expense
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
        bestService: 'Strategy & Direction', // Placeholder - would need service tracking
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
      if (!session) {
        alert('You must be logged in to add expenses.');
        setSavingExpense(false);
        return;
      }

      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0.');
        setSavingExpense(false);
        return;
      }

      let receiptUrl = null;
      let receiptPath = null;

      // Upload receipt if provided
      if (selectedReceipt) {
        const fileExt = selectedReceipt.name.split('.').pop();
        const fileName = `receipts/${Date.now()}-${selectedReceipt.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('financial-documents')
          .upload(fileName, selectedReceipt, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading receipt:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('financial-documents')
            .getPublicUrl(fileName);
          receiptUrl = publicUrl;
          receiptPath = fileName;
        }
      }

      const { data, error } = await (supabase as any)
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
        })
        .select();

      if (error) {
        console.error('Error adding expense:', error);
        alert(`Failed to add expense: ${error.message || 'Unknown error'}`);
      } else {
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
      }
    } catch (err: any) {
      console.error('Error adding expense:', err);
      alert(`Failed to add expense: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt) {
      alert('Please select a file to upload.');
      return;
    }

    setUploadingDoc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to upload documents.');
        setUploadingDoc(false);
        return;
      }

      const fileExt = selectedReceipt.name.split('.').pop();
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
      alert('Document uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      alert(`Failed to upload document: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      } else {
        await loadFinancialData();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const updateExpenseStatus = async (expenseId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('expenses')
        .update({ status: newStatus })
        .eq('id', expenseId);

      if (error) throw error;
      await loadFinancialData();
    } catch (err: any) {
      console.error('Error updating expense status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const exportToExcel = () => {
    // Simple CSV export (Excel-compatible)
    const headers = ['Date', 'Name', 'Category', 'Amount', 'Status', 'Added By'];
    const rows = filteredExpenses.map(exp => [
      exp.expense_date,
      exp.name,
      exp.category || '—',
      exp.amount.toFixed(2),
      exp.status || 'draft',
      exp.profiles?.full_name || 'Unknown',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (expenseFilter !== 'all' && exp.status !== expenseFilter) return false;
    if (monthFilter) {
      const expMonth = new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (expMonth !== monthFilter) return false;
    }
    return true;
  });

  // Get reimbursement info
  const lastReimbursement = expenses
    .filter(e => e.reimbursement_date)
    .sort((a, b) => new Date(b.reimbursement_date!).getTime() - new Date(a.reimbursement_date!).getTime())[0];
  
  const pendingReimbursements = expenses.filter(e => e.status === 'approved' && !e.reimbursement_date);
  const totalPendingReimbursement = pendingReimbursements.reduce((sum, exp) => sum + (exp.reimbursement_amount || exp.amount || 0), 0);

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Finance</h1>
          <p className="text-lg text-slate-700">
            Complete financial overview and expense tracking
          </p>
        </div>
      </div>

      {/* Monthly Recap */}
      {monthlyRecap && (
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-8 rounded-lg text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">IE Global – {currentMonth} Summary</h2>
              <p className="text-white/80">Monthly financial overview</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-white/80 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">€{monthlyRecap.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Net Revenue</p>
              <p className="text-2xl font-bold">€{monthlyRecap.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Invoices Paid</p>
              <p className="text-2xl font-bold">{monthlyRecap.invoicesPaid}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">New Clients</p>
              <p className="text-2xl font-bold">{monthlyRecap.newClients}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Top Expense</p>
              <p className="text-lg font-semibold">{monthlyRecap.topExpense}</p>
              <p className="text-sm text-white/70">€{monthlyRecap.topExpenseAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Best Service</p>
              <p className="text-lg font-semibold">{monthlyRecap.bestService}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-navy-900">Quick Actions</h2>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={() => setShowAddExpense(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 rounded-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit Expense
            </button>
            <button
              onClick={() => setShowUploadDoc(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white font-semibold hover:bg-navy-800 transition-all duration-200 rounded-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-navy-900 font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-navy-900">€{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-2">From paid invoices</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-navy-900">€{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-2">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Net Profit</p>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">{profitMargin}% margin</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
          <p className="text-3xl font-bold text-navy-900">{profitMargin}%</p>
          <p className="text-xs text-slate-500 mt-2">Revenue vs expenses</p>
        </div>
      </div>

      {/* Company Expenses & Cash Flow Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Company Expenses & Cash Flow</h2>
              <p className="text-sm text-slate-700">Track company expenses, cash flow, burn rate, and profitability</p>
            </div>
          </div>
          
          {/* Founder Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Total Monthly Expenses */}
            <div className="p-5 bg-off-white rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Total Monthly Expenses</p>
              <p className="text-2xl font-bold text-navy-900 mb-1">
                €{(() => {
                  const now = new Date();
                  const currentMonth = expenses.filter(e => {
                    const expDate = new Date(e.expense_date);
                    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                  }).reduce((sum, e) => sum + e.amount, 0);
                  return currentMonth.toFixed(2);
                })()}
              </p>
              <p className="text-xs text-slate-500">This month</p>
              {(() => {
                const now = new Date();
                const currentMonth = expenses.filter(e => {
                  const expDate = new Date(e.expense_date);
                  return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                }).reduce((sum, e) => sum + e.amount, 0);
                const lastMonth = expenses.filter(e => {
                  const expDate = new Date(e.expense_date);
                  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
                  return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear();
                }).reduce((sum, e) => sum + e.amount, 0);
                const change = lastMonth > 0 ? ((currentMonth - lastMonth) / lastMonth * 100) : 0;
                return (
                  <p className={`text-xs font-semibold mt-1 ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs last month
                  </p>
                );
              })()}
            </div>

            {/* Recurring Expenses */}
            <div className="p-5 bg-off-white rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Recurring Expenses</p>
              <p className="text-2xl font-bold text-navy-900 mb-1">
                {expenses.filter(e => e.cost_type === 'fixed' || e.category?.toLowerCase().includes('subscription') || e.category?.toLowerCase().includes('hosting')).length}
              </p>
              <p className="text-xs text-slate-500">Active subscriptions</p>
              <p className="text-sm font-semibold text-navy-900 mt-2">
                €{(() => {
                  const recurring = expenses.filter(e => e.cost_type === 'fixed' || e.category?.toLowerCase().includes('subscription') || e.category?.toLowerCase().includes('hosting'));
                  const monthlyTotal = recurring.reduce((sum, e) => sum + e.amount, 0);
                  return monthlyTotal.toFixed(2);
                })()} /month
              </p>
            </div>

            {/* Variable Expenses */}
            <div className="p-5 bg-off-white rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Variable Expenses</p>
              <p className="text-2xl font-bold text-navy-900 mb-1">
                €{(() => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  const variable = expenses.filter(e => {
                    const expDate = new Date(e.expense_date);
                    return expDate >= thirtyDaysAgo && (e.cost_type === 'variable' || !e.cost_type);
                  });
                  return variable.reduce((sum, e) => sum + e.amount, 0).toFixed(2);
                })()}
              </p>
              <p className="text-xs text-slate-500">Last 30 days</p>
              <p className="text-xs text-slate-600 mt-1">
                {expenses.filter(e => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  const expDate = new Date(e.expense_date);
                  return expDate >= thirtyDaysAgo && (e.cost_type === 'variable' || !e.cost_type);
                }).length} one-time expenses
              </p>
            </div>

            {/* Cash Burn Rate */}
            <div className="p-5 bg-off-white rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Cash Burn Rate</p>
              <p className="text-2xl font-bold text-navy-900 mb-1">
                €{(() => {
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
                  const avg = last3Months.reduce((sum, val) => sum + val, 0) / 3;
                  return avg.toFixed(2);
                })()}
              </p>
              <p className="text-xs text-slate-500">Avg monthly burn</p>
              <p className="text-xs text-slate-600 mt-1">Last 3 months average</p>
            </div>

            {/* Runway */}
            <div className="p-5 bg-off-white rounded-lg border border-gray-200">
              <p className="text-xs text-slate-600 mb-1 uppercase tracking-wide font-semibold">Runway</p>
              <p className="text-2xl font-bold text-navy-900 mb-1">
                {(() => {
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
                  // Placeholder: would need cash on hand input
                  const cashOnHand = totalRevenue; // Using revenue as placeholder
                  const months = avgBurn > 0 ? (cashOnHand / avgBurn) : 0;
                  return months > 0 ? months.toFixed(1) : '—';
                })()} months
              </p>
              <p className="text-xs text-slate-500">At current burn rate</p>
              <p className="text-xs text-slate-600 mt-1">Based on avg expenses</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-navy-900">Filter by:</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">All Months</option>
                {Array.from(new Set(expenses.map(e => new Date(e.expense_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })))).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                value={expenseFilter}
                onChange={(e) => setExpenseFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="all">All Types</option>
                <option value="recurring">Recurring</option>
                <option value="one-time">One-Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recurring Expenses Section */}
        <div className="mb-8 bg-off-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-1">Recurring Expenses</h3>
              <p className="text-sm text-slate-600">Track subscriptions, hosting, and monthly services</p>
            </div>
            <button
              onClick={() => {
                setShowAddExpense(true);
                // Pre-fill form with recurring defaults
              }}
              className="px-4 py-2 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-all duration-200 text-sm"
            >
              Add Recurring Expense
            </button>
          </div>
          
          {expenses.filter(e => e.is_recurring || e.cost_type === 'fixed').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">No recurring expenses yet</p>
              <p className="text-sm text-slate-500">Add subscriptions like Supabase, Vercel, Figma, etc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Billing Cycle</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Next Charge</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Payment Method</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-navy-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {expenses.filter(e => e.is_recurring || e.cost_type === 'fixed').map((expense) => (
                    <tr key={expense.id} className="hover:bg-off-white transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="font-semibold text-navy-900">{expense.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-600">€{expense.amount.toFixed(2)}</span>
                        <span className="text-xs text-slate-500 ml-1">
                          /{expense.billing_cycle === 'annual' ? 'year' : 'month'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded capitalize">
                          {expense.billing_cycle || 'monthly'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expense.next_charge_date ? (
                          <span className="text-sm text-slate-700">{formatDate(expense.next_charge_date)}</span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{expense.payment_method || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Expenses Table */}
        <div>
          <h3 className="text-xl font-bold text-navy-900 mb-4">All Expenses</h3>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-700 text-lg mb-2 font-semibold">No expenses found</p>
              <p className="text-sm text-slate-600 mb-4">Get started by submitting your first expense</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200"
              >
                Submit Your First Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-off-white border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Expense Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Paid With</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-navy-900 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-navy-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-off-white transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {expense.is_recurring && (
                            <span title="Recurring expense">
                              <svg className="w-5 h-5 text-navy-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </span>
                          )}
                          <div>
                            <div className="font-semibold text-navy-900">{expense.name}</div>
                            {expense.description && (
                              <div className="text-sm text-slate-600 mt-1">{expense.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {expense.category ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                            {expense.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {expense.is_recurring ? 'Recurring' : 'One-time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-lg text-red-600">€{expense.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{formatDate(expense.expense_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{expense.payment_method || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {expense.receipt_url ? (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-signal-red hover:text-signal-red/80 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              // TODO: Implement upload receipt for existing expense
                              alert('Receipt upload for existing expenses coming soon');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-navy-900 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete expense"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Financial Analytics</h2>
          <p className="text-sm text-slate-600">Visual breakdown of your financial data and cash flow</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Breakdown - Fixed vs Variable */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Expense Breakdown</h3>
              <p className="text-sm text-slate-600">Fixed costs (subscriptions, hosting) vs variable costs (advertising, contractors)</p>
            </div>
          {fixedVsVariable.length > 0 && fixedVsVariable.some(f => f.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fixedVsVariable}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fixedVsVariable.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                  <span className="font-semibold text-navy-900">Fixed Costs</span>
                  <span className="text-lg font-bold text-blue-600">
                    €{fixedVsVariable.find(f => f.name === 'Fixed Costs')?.value.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                  <span className="font-semibold text-navy-900">Variable Costs</span>
                  <span className="text-lg font-bold text-red-600">
                    €{fixedVsVariable.find(f => f.name === 'Variable Costs')?.value.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No expense data yet
            </div>
          )}
        </div>

          {/* Cash Flow Projection */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Cash Flow Projection</h3>
              <p className="text-sm text-slate-600">Track cash coming in and going out to see end-of-month balance</p>
            </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
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
                  formatter={(value: number) => `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
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
                  name="End Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-slate-500">
              No cash flow data yet
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Tools & Financial Documents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tools & Integrations */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Tools</h2>
          <p className="text-sm text-slate-600 mb-4">Access financial tools and integrations</p>
          <div className="space-y-3">
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">Stripe</p>
                <p className="text-xs text-slate-600">Payment processing</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://paypal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">PayPal</p>
                <p className="text-xs text-slate-600">Payment gateway</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <button
              onClick={exportToExcel}
              className="w-full flex items-center gap-3 p-3 bg-off-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">Export to Excel</p>
                <p className="text-xs text-slate-600">Download CSV file</p>
              </div>
            </button>
          </div>
        </div>

        {/* Financial Documents */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Financial Documents</h2>
              <p className="text-sm text-slate-600">Secure storage for tax returns, contracts, and agreements</p>
            </div>
            <button
              onClick={() => setShowUploadDoc(true)}
              className="px-4 py-2 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 text-sm"
            >
              Upload
            </button>
          </div>

          {financialDocs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-700 mb-2 font-semibold">No documents uploaded yet</p>
              <p className="text-sm text-slate-600 mb-4">Upload tax returns, contracts, and financial agreements</p>
              <button
                onClick={() => setShowUploadDoc(true)}
                className="px-4 py-2 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 text-sm"
              >
                Upload Your First Document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {financialDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-off-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-navy-900">{doc.name}</h3>
                      <span className="px-2 py-0.5 text-xs bg-white text-slate-600 rounded border border-gray-300 capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-all duration-200 text-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Submit New Expense</h2>
                  <p className="text-sm text-white/80 mt-1">Quick expense submission with receipt upload</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="expense-name" className="block text-sm font-semibold text-navy-900 mb-2">
                    Expense Name <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="expense-name"
                    required
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    placeholder="e.g., Office Supplies, Software License"
                  />
                </div>

                <div>
                  <label htmlFor="expense-description" className="block text-sm font-semibold text-navy-900 mb-2">
                    Description
                  </label>
                  <textarea
                    id="expense-description"
                    rows={3}
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg resize-none"
                    placeholder="Optional description or notes"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expense-amount" className="block text-sm font-semibold text-navy-900 mb-2">
                      Amount (€) <span className="text-signal-red">*</span>
                    </label>
                    <input
                      type="number"
                      id="expense-amount"
                      required
                      step="0.01"
                      min="0"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="expense-category" className="block text-sm font-semibold text-navy-900 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      id="expense-category"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                      placeholder="e.g., Software, Office, Travel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expense-date" className="block text-sm font-semibold text-navy-900 mb-2">
                      Expense Date <span className="text-signal-red">*</span>
                    </label>
                    <input
                      type="date"
                      id="expense-date"
                      required
                      value={newExpense.expense_date}
                      onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    />
                  </div>

                  <div>
                    <label htmlFor="expense-status" className="block text-sm font-semibold text-navy-900 mb-2">
                      Status
                    </label>
                    <select
                      id="expense-status"
                      value={newExpense.status}
                      onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="trip-name" className="block text-sm font-semibold text-navy-900 mb-2">
                      Trip Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="trip-name"
                      value={newExpense.trip_name}
                      onChange={(e) => setNewExpense({ ...newExpense, trip_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                      placeholder="e.g., Berlin Conference 2025"
                    />
                  </div>

                  <div>
                    <label htmlFor="cost-type" className="block text-sm font-semibold text-navy-900 mb-2">
                      Cost Type
                    </label>
                    <select
                      id="cost-type"
                      value={newExpense.cost_type}
                      onChange={(e) => setNewExpense({ ...newExpense, cost_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    >
                      <option value="variable">Variable</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="payment-method" className="block text-sm font-semibold text-navy-900 mb-2">
                    Paid With
                  </label>
                  <input
                    type="text"
                    id="payment-method"
                    value={newExpense.payment_method}
                    onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    placeholder="e.g., Business Account, Personal Card, PayPal"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-recurring"
                    checked={newExpense.is_recurring}
                    onChange={(e) => setNewExpense({ ...newExpense, is_recurring: e.target.checked })}
                    className="w-5 h-5 border-gray-300 rounded focus:ring-signal-red text-signal-red"
                  />
                  <label htmlFor="is-recurring" className="text-sm font-semibold text-navy-900">
                    This is a recurring expense (subscription, hosting, etc.)
                  </label>
                </div>

                {newExpense.is_recurring && (
                  <div className="grid grid-cols-2 gap-4 pl-8 border-l-2 border-signal-red">
                    <div>
                      <label htmlFor="billing-cycle" className="block text-sm font-semibold text-navy-900 mb-2">
                        Billing Cycle
                      </label>
                      <select
                        id="billing-cycle"
                        value={newExpense.billing_cycle}
                        onChange={(e) => setNewExpense({ ...newExpense, billing_cycle: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="next-charge-date" className="block text-sm font-semibold text-navy-900 mb-2">
                        Next Charge Date
                      </label>
                      <input
                        type="date"
                        id="next-charge-date"
                        value={newExpense.next_charge_date}
                        onChange={(e) => setNewExpense({ ...newExpense, next_charge_date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="receipt-upload" className="block text-sm font-semibold text-navy-900 mb-2">
                    Upload Receipt (Image/PDF)
                  </label>
                  <input
                    type="file"
                    id="receipt-upload"
                    accept="image/*,.pdf"
                    onChange={(e) => setSelectedReceipt(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                  />
                  {selectedReceipt && (
                    <p className="text-sm text-slate-600 mt-2">Selected: {selectedReceipt.name}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddExpense(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingExpense ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Expense
                    </>
                  )}
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
                  <p className="text-sm text-white/80 mt-1">Secure storage for tax returns, contracts, and agreements</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadDocument} className="p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="doc-name" className="block text-sm font-semibold text-navy-900 mb-2">
                    Document Name <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="text"
                    id="doc-name"
                    required
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    placeholder="e.g., 2024 Tax Return, Bank Statement Q1"
                  />
                </div>

                <div>
                  <label htmlFor="doc-type" className="block text-sm font-semibold text-navy-900 mb-2">
                    Document Type <span className="text-signal-red">*</span>
                  </label>
                  <select
                    id="doc-type"
                    required
                    value={newDoc.document_type}
                    onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                  >
                    <option value="tax_return">Tax Return</option>
                    <option value="contract">Contract</option>
                    <option value="financial_agreement">Financial Agreement</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="doc-tags" className="block text-sm font-semibold text-navy-900 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="doc-tags"
                    value={newDoc.tags}
                    onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                    placeholder="e.g., 2024, Q1, Important"
                  />
                </div>

                <div>
                  <label htmlFor="doc-file" className="block text-sm font-semibold text-navy-900 mb-2">
                    File <span className="text-signal-red">*</span>
                  </label>
                  <input
                    type="file"
                    id="doc-file"
                    required
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => setSelectedReceipt(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 rounded-lg"
                  />
                  {selectedReceipt && (
                    <p className="text-sm text-slate-600 mt-2">Selected: {selectedReceipt.name}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadDoc(false);
                    setSelectedReceipt(null);
                  }}
                  className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc || !selectedReceipt}
                  className="px-6 py-2.5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingDoc ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
