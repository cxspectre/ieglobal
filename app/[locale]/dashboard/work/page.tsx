'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  client: string;
  industry: string;
  services: string[];
  challenge: string;
  outcome: string | null;
  metrics: string[];
  cover_image_url: string | null;
  content: string;
  date: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export default function WorkPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  const [form, setForm] = useState({
    slug: '',
    title: '',
    summary: '',
    client: '',
    industry: '',
    services: '',
    challenge: '',
    outcome: '',
    metrics: '',
    cover_image_url: '',
    content: '',
    date: new Date().toISOString().slice(0, 10),
    featured: false,
  });

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const loadCaseStudies = async () => {
    try {
      const res = await fetch('/api/case-studies');
      const data = await res.json();
      setCaseStudies(Array.isArray(data) ? data : []);
    } catch {
      setCaseStudies([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      slug: '',
      title: '',
      summary: '',
      client: '',
      industry: '',
      services: '',
      challenge: '',
      outcome: '',
      metrics: '',
      cover_image_url: '',
      content: '',
      date: new Date().toISOString().slice(0, 10),
      featured: false,
    });
    setShowForm(true);
  };

  const openEdit = (cs: CaseStudy) => {
    setEditing(cs);
    setForm({
      slug: cs.slug,
      title: cs.title,
      summary: cs.summary,
      client: cs.client,
      industry: cs.industry,
      services: Array.isArray(cs.services) ? cs.services.join(', ') : '',
      challenge: cs.challenge,
      outcome: cs.outcome || '',
      metrics: Array.isArray(cs.metrics) ? cs.metrics.join('\n') : '',
      cover_image_url: cs.cover_image_url || '',
      content: cs.content || '',
      date: cs.date || new Date().toISOString().slice(0, 10),
      featured: cs.featured || false,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `cover-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('case-studies')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('case-studies')
        .getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Ensure the "case-studies" bucket exists in Supabase Storage (public).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const services = form.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const metrics = form.metrics
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        slug,
        title: form.title,
        summary: form.summary,
        client: form.client,
        industry: form.industry,
        services,
        challenge: form.challenge,
        outcome: form.outcome || null,
        metrics,
        cover_image_url: form.cover_image_url || null,
        content: form.content,
        date: form.date,
        featured: form.featured,
      };
      if (editing) {
        const res = await fetch(`/api/case-studies/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Update failed');
        }
      } else {
        const res = await fetch('/api/case-studies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Create failed');
        }
      }
      setShowForm(false);
      loadCaseStudies();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case study?')) return;
    try {
      const res = await fetch(`/api/case-studies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setShowForm(false);
      loadCaseStudies();
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Case Studies</h1>
          <p className="text-slate-600 mt-1">
            Manage work projects shown on the public website
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Case Study
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : caseStudies.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <p className="text-slate-600 mb-4">No case studies yet.</p>
          <button
            onClick={openAdd}
            className="text-signal-red font-semibold hover:underline"
          >
            Add your first case study
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {cs.cover_image_url && (
                <div className="h-40 bg-slate-200 relative">
                  <img
                    src={cs.cover_image_url}
                    alt={cs.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <span className="text-xs font-semibold text-signal-red uppercase tracking-wide">
                  {cs.industry}
                </span>
                <h3 className="text-lg font-bold text-navy-900 mt-2 line-clamp-1">{cs.title}</h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{cs.summary}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    href={`/case-studies/${cs.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-signal-red hover:underline"
                  >
                    View on site
                  </Link>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => openEdit(cs)}
                    className="text-sm font-semibold text-slate-600 hover:text-navy-900"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDelete(cs.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-navy-900">
                  {editing ? 'Edit Case Study' : 'Add Case Study'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    placeholder="e.g. Digital transformation for consulting firm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    placeholder="e.g. consulting-firm-transformation (auto-generated if empty)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Summary *</label>
                  <textarea
                    required
                    rows={2}
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    placeholder="Brief description shown on cards"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Client *</label>
                    <input
                      type="text"
                      required
                      value={form.client}
                      onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Industry *</label>
                    <input
                      type="text"
                      required
                      value={form.industry}
                      onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                      placeholder="e.g. Consulting & Business Services"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Services (comma-separated)</label>
                  <input
                    type="text"
                    value={form.services}
                    onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    placeholder="e.g. Strategy & Direction, Websites & Platforms"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">The Challenge *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.challenge}
                    onChange={(e) => setForm((f) => ({ ...f, challenge: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">The Outcome</label>
                  <input
                    type="text"
                    value={form.outcome}
                    onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Key Metrics (one per line)</label>
                  <textarea
                    rows={3}
                    value={form.metrics}
                    onChange={(e) => setForm((f) => ({ ...f, metrics: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    placeholder="Load time reduced to under 1 second&#10;Lighthouse scores improved to 90+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image</label>
                  <div className="flex gap-3 items-start">
                    {form.cover_image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Content (Markdown)</label>
                  <textarea
                    rows={8}
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red font-mono text-sm"
                    placeholder="## Client Context&#10;...&#10;&#10;## The Challenge&#10;..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Featured</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
