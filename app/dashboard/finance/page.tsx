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

type Expense = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  category: string | null;
  expense_date: string;
  created_by: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
};

type MonthlyFinancial = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancial[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
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
      const { data: paidInvoices, error: invoicesError } = await (supabase as any)
        .from('invoices')
        .select('amount, created_at')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      if (invoicesError) {
        console.error('Error loading invoices:', invoicesError);
      }

      const totalRev = paidInvoices?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0;
      setTotalRevenue(totalRev);

      // Get all expenses
      const { data: expensesData, error: expensesError } = await (supabase as any)
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      // If expenses table doesn't exist yet, just continue with empty expenses
      if (expensesError) {
        console.error('Error loading expenses (table may not exist yet):', expensesError);
        setExpenses([]);
        setTotalExpenses(0);
        setMonthlyData([]);
        setCategoryBreakdown([]);
        setLoading(false);
        return;
      }

      // Get creator profiles separately
      if (expensesData && expensesData.length > 0) {
        try {
          const creatorIds = [...new Set(expensesData.map((e: any) => e.created_by))];
          const { data: profilesData, error: profilesError } = await (supabase as any)
            .from('profiles')
            .select('id, full_name, email')
            .in('id', creatorIds);

          if (profilesError) {
            console.error('Error loading profiles:', profilesError);
          }

          // Map profiles to expenses
          const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);
          expensesData.forEach((expense: any) => {
            expense.profiles = profilesMap.get(expense.created_by) || null;
          });
        } catch (err) {
          console.error('Error mapping profiles to expenses:', err);
        }
      }

      if (expensesData) {
        setExpenses(expensesData);
        const totalExp = expensesData.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        setTotalExpenses(totalExp);
      } else {
        setExpenses([]);
        setTotalExpenses(0);
      }

      // Calculate monthly financial data (last 12 months)
      const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
      const now = new Date();
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyMap.set(key, { revenue: 0, expenses: 0 });
      }

      // Aggregate revenue by month
      paidInvoices?.forEach((invoice: any) => {
        const date = new Date(invoice.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.revenue += invoice.amount || 0;
        }
      });

      // Aggregate expenses by month
      expensesData?.forEach((expense: any) => {
        const date = new Date(expense.expense_date);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.expenses += expense.amount || 0;
        }
      });

      const monthlyArray: MonthlyFinancial[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        profit: Math.round((data.revenue - data.expenses) * 100) / 100,
      }));

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

      setLoading(false);
    } catch (err) {
      console.error('Error loading financial data:', err);
      // Set defaults on error
      setExpenses([]);
      setTotalExpenses(0);
      setMonthlyData([]);
      setCategoryBreakdown([]);
      setLoading(false);
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

      const { error } = await (supabase as any)
        .from('expenses')
        .insert({
          name: newExpense.name,
          description: newExpense.description || null,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category || null,
          expense_date: newExpense.expense_date,
          created_by: session.user.id,
        });

      if (error) {
        console.error('Error adding expense:', error);
        alert(`Failed to add expense: ${error.message}`);
      } else {
        setNewExpense({
          name: '',
          description: '',
          amount: '',
          category: '',
          expense_date: new Date().toISOString().split('T')[0],
        });
        setShowAddExpense(false);
        await loadFinancialData();
      }
    } catch (err: any) {
      console.error('Error adding expense:', err);
      alert(`Failed to add expense: ${err.message}`);
    } finally {
      setSavingExpense(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Finance</h1>
          <p className="text-lg text-slate-700">
            Complete financial overview and expense tracking
          </p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white rounded-lg">
          <p className="text-sm text-white/80 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">€{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-white/70 mt-2">From paid invoices</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 text-white rounded-lg">
          <p className="text-sm text-white/80 mb-1">Total Expenses</p>
          <p className="text-3xl font-bold">€{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-white/70 mt-2">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={`p-6 rounded-lg ${netProfit >= 0 ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-br from-red-600 to-red-700 text-white'}`}>
          <p className="text-sm text-white/80 mb-1">Net Profit</p>
          <p className="text-3xl font-bold">€{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-white/70 mt-2">{profitMargin}% margin</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
          <p className="text-3xl font-bold text-navy-900">{profitMargin}%</p>
          <p className="text-xs text-slate-500 mt-2">Revenue vs expenses</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Profit & Loss */}
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Monthly Profit & Loss</h2>
          <ResponsiveContainer width="100%" height={350}>
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
                formatter={(value: number) => `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', r: 3 }}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-8 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Expenses by Category</h2>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
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
              No expense categories yet
            </div>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy-900">Expense History</h2>
          <span className="text-sm text-slate-600">
            {expenses.length} total expense{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-700 text-lg mb-4">No expenses recorded yet.</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="text-signal-red hover:text-signal-red/80 font-semibold"
            >
              Add your first expense →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-off-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Added By
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-navy-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-off-white transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDate(expense.expense_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-navy-900">{expense.name}</div>
                        {expense.description && (
                          <div className="text-sm text-slate-600 mt-1">{expense.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {expense.category ? (
                        <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                          {expense.category}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-red-600">€{expense.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {expense.profiles?.full_name || expense.profiles?.email || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
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

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-signal-red/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add Expense</h2>
                    <p className="text-sm text-white/80 mt-1">Record a new business expense</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddExpense(false)}
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
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
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
                      Add Expense
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

