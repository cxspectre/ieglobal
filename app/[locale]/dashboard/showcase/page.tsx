'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';

const SLOTS = [1, 2, 3, 4, 5, 6] as const;

type ShowcaseRow = {
  id: string;
  sort_order: number;
  project_url: string;
  description: string | null;
  industry_type: string;
  created_at: string;
  updated_at: string;
};

const emptySlot = (order: number): Partial<ShowcaseRow> => ({
  sort_order: order,
  project_url: '',
  description: '',
  industry_type: '',
});

export default function DashboardShowcasePage() {
  const [items, setItems] = useState<Record<number, ShowcaseRow | Partial<ShowcaseRow>>>(() =>
    Object.fromEntries(SLOTS.map((n) => [n, { ...emptySlot(n) }]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('showcase')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as ShowcaseRow[];
      const byOrder: Record<number, ShowcaseRow | Partial<ShowcaseRow>> = {};
      SLOTS.forEach((n) => {
        byOrder[n] = rows.find((r) => r.sort_order === n) ?? { ...emptySlot(n) };
      });
      setItems(byOrder);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load showcase.' });
    } finally {
      setLoading(false);
    }
  };

  const updateSlot = (order: number, field: keyof ShowcaseRow, value: string | null) => {
    setItems((prev) => ({
      ...prev,
      [order]: { ...prev[order], [field]: value ?? '' },
    }));
  };

  const saveSlot = async (order: number) => {
    const row = items[order];
    const project_url = (row?.project_url ?? '').trim();
    const industry_type = (row?.industry_type ?? '').trim();
    if (!project_url || !industry_type) {
      setMessage({ type: 'error', text: 'Project URL and industry type are required.' });
      return;
    }
    setSaving(order);
    setMessage(null);
    try {
      const payload = {
        sort_order: order,
        project_url,
        description: (row?.description ?? '').trim() || null,
        industry_type,
        updated_at: new Date().toISOString(),
      };
      const id = (row as ShowcaseRow).id;
      if (id) {
        const { error } = await (supabase as any).from('showcase').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('showcase').upsert(payload, { onConflict: 'sort_order' });
        if (error) throw error;
      }
      setMessage({ type: 'success', text: `Slot ${order} saved.` });
      await load();
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Failed to save.' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 border-2 border-signal-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Showcase</h1>
          <p className="text-slate-600 mt-1">
            Manage the 6 projects on the public showcase page (
            <Link href="/showcase" target="_blank" rel="noopener noreferrer" className="text-signal-red hover:underline">
              /showcase
            </Link>
            ).
          </p>
        </div>
        <Link
          href="/showcase"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-medium"
        >
          View showcase page
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SLOTS.map((order) => {
          const row = items[order];
          const isSaving = saving === order;
          return (
            <div
              key={order}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-slate-900">Slot {order}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  Industry
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={row?.project_url ?? ''}
                    onChange={(e) => updateSlot(order, 'project_url', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-signal-red focus:ring-1 focus:ring-signal-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industry type
                  </label>
                  <input
                    type="text"
                    value={row?.industry_type ?? ''}
                    onChange={(e) => updateSlot(order, 'industry_type', e.target.value)}
                    placeholder="e.g. Healthcare, Fintech, Retail"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-signal-red focus:ring-1 focus:ring-signal-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={row?.description ?? ''}
                    onChange={(e) => updateSlot(order, 'description', e.target.value)}
                    placeholder="Short description of the project"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-signal-red focus:ring-1 focus:ring-signal-red"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => saveSlot(order)}
                  disabled={isSaving}
                  className="w-full rounded-lg bg-signal-red px-4 py-2 text-sm font-medium text-white hover:bg-signal-red/90 disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Save slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
