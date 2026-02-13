'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

const TEMPLATE_BASE_DOMAIN = process.env.NEXT_PUBLIC_TEMPLATE_BASE_DOMAIN || 'templates.ie-global.net';

const TEMPLATE_CATEGORIES = [
  'Corporate',
  'Agency',
  'Minimal',
  'Landing Page',
  'Portfolio',
  'E-commerce',
  'Blog',
  'SaaS',
  'Startup',
  'Consulting',
  'Creative',
  'Other',
];

type WebsiteTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string;
  template_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadTargetSlug, setUploadTargetSlug] = useState<string | null>(null);
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);

  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!editingId && name && !slug) {
      setSlug(slugFromName(name));
    }
  }, [name, editingId, slug]);

  const loadTemplates = async () => {
    setError(null);
    setLoading(true);
    try {
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

      if (!profile || (profile.role !== 'admin' && profile.role !== 'employee')) {
        router.replace('/dashboard');
        return;
      }

      const { data, error: listError } = await (supabase as any)
        .from('website_templates')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (listError) {
        setError('Failed to load templates.');
      } else {
        setTemplates(data || []);
      }
    } catch {
      setError('Failed to load templates.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    setThumbnailUrl('');
    setPublished(true);
    setZipFile(null);
    setUploadTargetSlug(null);
    setAddStep(1);
    setIsModalOpen(true);
  };

  const openEdit = (t: WebsiteTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setSlug(t.slug || slugFromName(t.name));
    setDescription(t.description || '');
    setCategory(t.category);
    setThumbnailUrl(t.thumbnail_url || '');
    setPublished(t.published);
    setZipFile(null);
    setUploadTargetSlug(null);
    setAddStep(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !slug.trim()) return;

    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    if (safeSlug.length < 2) {
      setError('Slug must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const templateUrl = `https://${safeSlug}.${TEMPLATE_BASE_DOMAIN}`;
      const payload = {
        name: name.trim(),
        slug: safeSlug,
        description: description.trim() || null,
        category: category.trim(),
        template_url: templateUrl,
        thumbnail_url: thumbnailUrl.trim() || null,
        published,
      };

      if (editingId) {
        const { error: updateError } = await (supabase as any)
          .from('website_templates')
          .update(payload)
          .eq('id', editingId);

        if (updateError) setError(updateError.message || 'Failed to update template.');
        else {
          setSuccess('Template updated.');
          setUploadTargetSlug(safeSlug);
          if (zipFile) {
            await doUpload(safeSlug, zipFile);
          } else {
            await loadTemplates();
            setIsModalOpen(false);
          }
        }
      } else {
        const { error: insertError } = await (supabase as any)
          .from('website_templates')
          .insert(payload);

        if (insertError) setError(insertError.message || 'Failed to add template.');
        else {
          setSuccess('Template created.');
          setUploadTargetSlug(safeSlug);
          if (zipFile) {
            await doUpload(safeSlug, zipFile);
          } else {
            setAddStep(3);
            setSuccess('Template saved. Add files later via Edit.');
            await loadTemplates();
          }
        }
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const doUpload = async (targetSlug: string, file: File) => {
    setUploading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.set('slug', targetSlug);
      formData.set('file', file);

      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Upload failed');
      } else {
        setSuccess(`Uploaded ${json.uploaded} files. Template live at ${json.templateUrl}`);
        setZipFile(null);
        setAddStep(3);
        await loadTemplates();
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadZip = async () => {
    if (!uploadTargetSlug || !zipFile) return;
    await doUpload(uploadTargetSlug, zipFile);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? It will no longer appear on the public templates page.')) return;

    try {
      const { error: deleteError } = await (supabase as any)
        .from('website_templates')
        .delete()
        .eq('id', id);

      if (deleteError) setError('Failed to delete template.');
      else await loadTemplates();
    } catch {
      setError('Failed to delete template.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-signal-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pt-12 lg:pt-16 pb-16 px-4 lg:px-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mb-1">Work · Content</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-navy-900">Website Templates</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Add templates and upload a zip of your built site. Each template gets a branded subdomain: <code className="text-sm bg-slate-100 px-1 rounded">slug.templates.ie-global.net</code>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-sm text-slate-600">
          {templates.filter((t) => t.published).length} published · {templates.length} total
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add template
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
            </div>
            <p className="font-semibold text-navy-900 mb-1">No templates yet</p>
            <p className="text-sm text-slate-600 mb-4">Add a template, then upload a zip of your built website files.</p>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90"
            >
              Add your first template
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {templates.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-slate-50/50"
              >
                {t.thumbnail_url ? (
                  <div className="shrink-0 w-24 h-16 rounded-lg bg-slate-100 overflow-hidden">
                    <img src={t.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 w-24 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-navy-900">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                      {t.category}
                    </span>
                    {t.slug && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-navy-100 text-navy-700">
                        {t.slug}
                      </span>
                    )}
                    {!t.published && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        Draft
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{t.description}</p>
                  )}
                  <a
                    href={t.template_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-signal-red font-semibold hover:underline mt-1 inline-block"
                  >
                    {t.template_url}
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Add flow: step wizard */}
            {!editingId && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${addStep >= 1 ? 'bg-signal-red text-white' : 'bg-slate-100 text-slate-600'}`}>1</span>
                    <span className="w-4 h-0.5 bg-slate-200" />
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${addStep >= 2 ? 'bg-signal-red text-white' : 'bg-slate-100 text-slate-600'}`}>2</span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-900">
                    {addStep === 1 ? 'Step 1 — Upload template files' : addStep === 2 ? 'Step 2 — Add template details' : 'Done'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {addStep === 1 && 'Upload a zip of your built website (index.html, CSS, JS, images).'}
                    {addStep === 2 && 'Name, slug, and category — these appear on the public templates page.'}
                    {addStep === 3 && 'Your template is ready.'}
                  </p>
                </div>

                {addStep === 1 && (
                  <div className="p-6 space-y-6">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingZip(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingZip(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingZip(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file?.name.toLowerCase().endsWith('.zip')) setZipFile(file);
                      }}
                      className={`relative w-full min-h-[180px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                        isDraggingZip
                          ? 'border-signal-red bg-signal-red/5'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                      onClick={() => document.getElementById('template-zip-input')?.click()}
                    >
                      <input
                        id="template-zip-input"
                        type="file"
                        accept=".zip"
                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                      {zipFile ? (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-navy-900">{zipFile.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {(zipFile.size / 1024).toFixed(1)} KB · Ready to upload
                          </p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setZipFile(null); }}
                            className="mt-3 text-xs font-semibold text-signal-red hover:underline"
                          >
                            Choose different file
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-base font-medium text-slate-700">
                            {isDraggingZip ? 'Drop zip here' : 'Drag & drop your .zip file'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                          <p className="text-xs text-slate-400 mt-2">index.html, CSS, JS, images — root or dist folder is fine</p>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsModalOpen(false); setSuccess(null); }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => zipFile && setAddStep(2)}
                        disabled={!zipFile}
                        className="px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {addStep === 2 && (
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                      <span className="text-sm font-medium text-slate-600">Uploaded:</span>
                      <span className="text-sm font-semibold text-navy-900">{zipFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => setAddStep(1)}
                        className="text-xs font-semibold text-signal-red hover:underline ml-auto"
                      >
                        Change
                      </button>
                    </div>
              <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. Consulting Landing"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. consulting-landing"
                    />
                    <p className="text-xs text-slate-500 mt-1">URL: https://{slug || 'slug'}.{TEMPLATE_BASE_DOMAIN}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none bg-white"
                      required
                    >
                      <option value="">Select category</option>
                      {[...TEMPLATE_CATEGORIES, ...(category && !TEMPLATE_CATEGORIES.includes(category) ? [category] : [])].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
              <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none"
                      placeholder="Brief description of the template..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="published-add"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded border-slate-300 text-signal-red focus:ring-signal-red"
                    />
                    <label htmlFor="published-add" className="text-sm font-medium text-slate-700">
                      Published (visible on public templates page)
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setAddStep(1)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90 disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create template'}
                    </button>
                  </div>
                </form>
                )}

                {addStep === 3 && (
                  <div className="p-6 space-y-6">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 mb-2">Template ready</h3>
                      <p className="text-sm text-slate-600">
                        {uploadTargetSlug
                          ? `Live at https://${uploadTargetSlug}.${TEMPLATE_BASE_DOMAIN}`
                          : 'Your template has been created.'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {uploadTargetSlug && (
                        <a
                          href={`https://${uploadTargetSlug}.${TEMPLATE_BASE_DOMAIN}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90 text-center"
                        >
                          View template →
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setSuccess(null);
                          setAddStep(1);
                          setZipFile(null);
                          setUploadTargetSlug(null);
                          loadTemplates();
                        }}
                        className="px-4 py-2.5 rounded-lg border-2 border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Edit flow: single form */}
            {editingId && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-navy-900">Edit template</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Update details or upload new files.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. Consulting Landing"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. consulting-landing"
                    />
                    <p className="text-xs text-slate-500 mt-1">URL: https://{slug || 'slug'}.{TEMPLATE_BASE_DOMAIN}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none bg-white"
                      required
                    >
                      <option value="">Select category</option>
                      {[...TEMPLATE_CATEGORIES, ...(category && !TEMPLATE_CATEGORIES.includes(category) ? [category] : [])].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Template files (zip)</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingZip(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingZip(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingZip(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file?.name.toLowerCase().endsWith('.zip')) setZipFile(file);
                      }}
                      className={`relative w-full min-h-[100px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                        isDraggingZip ? 'border-signal-red bg-signal-red/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                      onClick={() => document.getElementById('template-zip-edit')?.click()}
                    >
                      <input
                        id="template-zip-edit"
                        type="file"
                        accept=".zip"
                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                      {zipFile ? (
                        <p className="text-sm font-semibold text-navy-900">{zipFile.name} — will replace existing files</p>
                      ) : (
                        <p className="text-sm text-slate-600">Drag & drop or click to upload new .zip (optional)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none"
                      placeholder="Brief description of the template..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="published-edit"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="rounded border-slate-300 text-signal-red focus:ring-signal-red"
                    />
                    <label htmlFor="published-edit" className="text-sm font-medium text-slate-700">
                      Published (visible on public templates page)
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); setSuccess(null); }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-lg bg-signal-red text-white text-sm font-bold hover:bg-signal-red/90 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Update template'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
