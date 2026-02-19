'use client';

import { useEffect, useRef, useState } from 'react';
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
  gallery_urls?: string[] | null;
  long_description?: string | null;
  features?: string[] | null;
  author?: string | null;
  page_names?: string[] | null;
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [longDescription, setLongDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [author, setAuthor] = useState('');
  const [pageNamesText, setPageNamesText] = useState('');
  const [published, setPublished] = useState(true);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<{ file: File; path: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadTargetSlug, setUploadTargetSlug] = useState<string | null>(null);
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2 | 3>(1);
  const folderInputAddRef = useRef<HTMLInputElement | null>(null);
  const folderInputEditRef = useRef<HTMLInputElement | null>(null);

  const setFolderInputAttrs = (node: HTMLInputElement | null) => {
    if (node) {
      node.setAttribute('webkitdirectory', '');
      node.setAttribute('directory', '');
      node.setAttribute('mozdirectory', '');
    }
  };

  const ALLOWED_EXT = new Set(['html', 'htm', 'css', 'js', 'mjs', 'json', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'xml', 'map']);
  const getExt = (p: string) => {
    const i = p.lastIndexOf('.');
    return i >= 0 ? p.slice(i + 1).toLowerCase() : '';
  };

  const pickFolder = async (): Promise<{ file: File; path: string }[] | null> => {
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as Window & { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker!();
        const out: { file: File; path: string }[] = [];
        const skipDirs = new Set(['node_modules', '__MACOSX', '.git']);
        const walk = async (handle: FileSystemDirectoryHandle, prefix: string) => {
          for await (const [, entry] of (handle as unknown as { entries: () => AsyncIterable<[string, FileSystemHandle]> }).entries()) {
            if (entry.kind === 'directory' && skipDirs.has(entry.name)) continue;
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.kind === 'file') {
              if (entry.name.startsWith('._')) continue;
              const ext = getExt(entry.name);
              if (ALLOWED_EXT.has(ext)) {
                const file = await (entry as FileSystemFileHandle).getFile();
                out.push({ file, path: relPath });
              }
            } else if (entry.kind === 'directory') {
              await walk(entry as unknown as FileSystemDirectoryHandle, relPath);
            }
          }
        };
        await walk(dirHandle, '');
        return out;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSelectFolder = async () => {
    const picked = await pickFolder();
    if (picked?.length) {
      setFolderFiles(picked);
      setZipFile(null);
    } else if (folderInputAddRef.current || folderInputEditRef.current) {
      (folderInputAddRef.current || folderInputEditRef.current)?.click();
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const items = Array.from(files).map((f) => ({
        file: f,
        path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
      }));
      setFolderFiles(items);
      setZipFile(null);
    }
    e.target.value = '';
  };

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
    setThumbnailFile(null);
    setGalleryUrls([]);
    setGalleryFiles([]);
    setLongDescription('');
    setFeaturesText('');
    setAuthor('');
    setPageNamesText('');
    setPublished(true);
    setZipFile(null);
    setFolderFiles([]);
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
    setThumbnailFile(null);
    setGalleryUrls(Array.isArray(t.gallery_urls) ? t.gallery_urls : []);
    setGalleryFiles([]);
    setLongDescription(t.long_description || '');
    setFeaturesText(Array.isArray(t.features) ? t.features.join('\n') : '');
    setAuthor(t.author || '');
    setPageNamesText(Array.isArray(t.page_names) ? t.page_names.join('\n') : '');
    setPublished(t.published);
    setZipFile(null);
    setFolderFiles([]);
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
      let finalThumbnailUrl = thumbnailUrl.trim() || null;
      if (thumbnailFile) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Session expired. Please sign in again.');
          setSubmitting(false);
          return;
        }
        const fd = new FormData();
        fd.set('slug', safeSlug);
        fd.set('file', thumbnailFile);
        const res = await fetch('/api/templates/thumbnail', {
          method: 'POST',
          credentials: 'include',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: fd,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Thumbnail upload failed');
          setSubmitting(false);
          return;
        }
        finalThumbnailUrl = json.url;
      }

      let finalGalleryUrls: string[] = [...galleryUrls];
      if (galleryFiles.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const fd = new FormData();
          fd.set('slug', safeSlug);
          galleryFiles.forEach((f) => fd.append('files', f));
          const res = await fetch('/api/templates/gallery', {
            method: 'POST',
            credentials: 'include',
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: fd,
          });
          const json = await res.json();
          if (res.ok && Array.isArray(json.urls)) {
            finalGalleryUrls = [...galleryUrls, ...json.urls];
          }
        }
      }

      const featuresArr = featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const pageNamesArr = pageNamesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const templateUrl = `https://${safeSlug}.${TEMPLATE_BASE_DOMAIN}`;
      const payload = {
        name: name.trim(),
        slug: safeSlug,
        description: description.trim() || null,
        category: category.trim(),
        template_url: templateUrl,
        thumbnail_url: finalThumbnailUrl,
        gallery_urls: finalGalleryUrls.length > 0 ? finalGalleryUrls : null,
        long_description: longDescription.trim() || null,
        features: featuresArr.length > 0 ? featuresArr : null,
        author: author.trim() || null,
        page_names: pageNamesArr.length > 0 ? pageNamesArr : null,
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
          const hasFiles = zipFile || folderFiles.length > 0;
          if (hasFiles) {
            await doUpload(safeSlug, zipFile || folderFiles);
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
          const hasFiles = zipFile || folderFiles.length > 0;
          if (hasFiles) {
            await doUpload(safeSlug, zipFile || folderFiles);
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

  const doUpload = async (targetSlug: string, fileOrFiles: File | { file: File; path: string }[]) => {
    setUploading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.set('slug', targetSlug);
      if (Array.isArray(fileOrFiles)) {
        for (const item of fileOrFiles) {
          const f = item.file;
          const path = item.path;
          formData.append('files', f, path);
        }
      } else {
        formData.set('file', fileOrFiles);
      }

      const res = await fetch('/api/templates/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Upload failed');
      } else {
        setSuccess(`Uploaded ${json.uploaded} files. Template live at ${json.templateUrl}`);
        setZipFile(null);
        setFolderFiles([]);
        setAddStep(3);
        await loadTemplates();
        setIsModalOpen(false);
        setAddStep(1);
      }
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadFiles = async () => {
    if (!uploadTargetSlug) return;
    const hasFiles = zipFile || folderFiles.length > 0;
    if (!hasFiles) return;
    await doUpload(uploadTargetSlug, zipFile || folderFiles);
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
          Add templates and upload a .zip or folder with your built site. Each template gets a branded subdomain: <code className="text-sm bg-slate-100 px-1 rounded">slug.templates.ie-global.net</code>
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
            <p className="text-sm text-slate-600 mb-4">Add a template, then upload a .zip or folder with your built website files.</p>
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
                    {addStep === 1 && 'Upload a .zip or select a folder with your built website (index.html, CSS, JS, images).'}
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
                        const files = e.dataTransfer.files;
                        if (files?.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
                          setZipFile(files[0]);
                          setFolderFiles([]);
                        } else if (files?.length && (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath) {
                          setFolderFiles(Array.from(files).map((f) => ({
                            file: f,
                            path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                          })));
                          setZipFile(null);
                        }
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
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setZipFile(f);
                            setFolderFiles([]);
                          }
                          e.target.value = '';
                        }}
                        className="sr-only"
                      />
                      <input
                        ref={(el) => {
                          folderInputAddRef.current = el;
                          setFolderInputAttrs(el);
                        }}
                        id="template-folder-input"
                        type="file"
                        multiple
                        onChange={handleFolderInputChange}
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
                      ) : folderFiles.length > 0 ? (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold text-navy-900">{folderFiles.length} files selected</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {folderFiles[0]?.path?.split('/')[0] || 'Folder'} · Ready to upload
                          </p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFolderFiles([]); }}
                            className="mt-3 text-xs font-semibold text-signal-red hover:underline"
                          >
                            Choose different folder
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-base font-medium text-slate-700">
                            {isDraggingZip ? 'Drop files here' : 'Drag & drop .zip or folder'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                          <div className="flex gap-3 mt-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); document.getElementById('template-zip-input')?.click(); }}
                              className="text-xs font-semibold text-signal-red hover:underline"
                            >
                              Upload .zip
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSelectFolder(); }}
                              className="text-xs font-semibold text-signal-red hover:underline"
                            >
                              Select folder
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">Folder picker works best in Chrome/Edge. In Safari, use .zip or drag & drop.</p>
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
                        onClick={() => (zipFile || folderFiles.length > 0) && setAddStep(2)}
                        disabled={!zipFile && folderFiles.length === 0}
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
                      <span className="text-sm font-semibold text-navy-900">
                        {zipFile ? zipFile.name : folderFiles.length > 0 ? `${folderFiles.length} files from folder` : ''}
                      </span>
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Thumbnail</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setThumbnailFile(f);
                          setThumbnailUrl('');
                        }
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-2 border border-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-signal-red file:text-white file:text-sm file:font-semibold hover:file:bg-signal-red/90 file:cursor-pointer focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                    {(thumbnailFile || thumbnailUrl) && (
                      <div className="mt-2 w-24 h-16 border border-slate-200 overflow-hidden bg-slate-50">
                        {thumbnailFile ? (
                          <img
                            src={URL.createObjectURL(thumbnailFile)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                        ) : (
                          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, WebP, GIF. Max 5MB.</p>
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
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gallery images</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setGalleryFiles((prev) => [...prev, ...files]);
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-2 border border-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-signal-red file:text-white file:text-sm file:font-semibold hover:file:bg-signal-red/90 file:cursor-pointer focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                    {(galleryUrls.length > 0 || galleryFiles.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {galleryUrls.map((url, i) => (
                          <div key={url} className="w-16 h-12 border border-slate-200 overflow-hidden bg-slate-50 relative">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryUrls((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs leading-none flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {galleryFiles.map((f, i) => (
                          <div key={`${f.name}-${i}`} className="w-16 h-12 border border-slate-200 overflow-hidden bg-slate-50 relative">
                            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                            <button
                              type="button"
                              onClick={() => setGalleryFiles((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs leading-none flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-500">Multiple images for showcase. Max 10, 5MB each.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Long description (Markdown)</label>
                    <textarea
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-y font-mono"
                      placeholder="Full description, headings, bullet points. Supports **bold**, *italic*, ## headings, - bullets..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Features (one per line)</label>
                    <textarea
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none font-mono"
                      placeholder="Modern Design\nFully Responsive\nSEO Optimized"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. IE Global"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Page names (one per line)</label>
                    <textarea
                      value={pageNamesText}
                      onChange={(e) => setPageNamesText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none font-mono"
                      placeholder="Home\nAbout\nBlog\nContact"
                    />
                    <p className="mt-1 text-xs text-slate-500">Pages included in the template (shown in sidebar)</p>
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
                          setFolderFiles([]);
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Template files</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingZip(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingZip(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingZip(false);
                        const files = e.dataTransfer.files;
                        if (files?.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
                          setZipFile(files[0]);
                          setFolderFiles([]);
                        } else if (files?.length && (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath) {
                          setFolderFiles(Array.from(files).map((f) => ({
                            file: f,
                            path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name,
                          })));
                          setZipFile(null);
                        }
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
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setZipFile(f);
                            setFolderFiles([]);
                          }
                          e.target.value = '';
                        }}
                        className="sr-only"
                      />
                      <input
                        ref={(el) => {
                          folderInputEditRef.current = el;
                          setFolderInputAttrs(el);
                        }}
                        id="template-folder-edit"
                        type="file"
                        multiple
                        onChange={handleFolderInputChange}
                        className="sr-only"
                      />
                      {zipFile ? (
                        <p className="text-sm font-semibold text-navy-900">{zipFile.name} — will replace existing files</p>
                      ) : folderFiles.length > 0 ? (
                        <p className="text-sm font-semibold text-navy-900">{folderFiles.length} files — will replace existing</p>
                      ) : (
                        <p className="text-sm text-slate-600">Drag & drop .zip, or <button type="button" onClick={(ev) => { ev.stopPropagation(); handleSelectFolder(); }} className="text-signal-red font-semibold hover:underline">select folder</button> (optional)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Thumbnail</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setThumbnailFile(f);
                          setThumbnailUrl('');
                        }
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-2 border border-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-signal-red file:text-white file:text-sm file:font-semibold hover:file:bg-signal-red/90 file:cursor-pointer focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                    {(thumbnailFile || thumbnailUrl) && (
                      <div className="mt-2 w-24 h-16 border border-slate-200 overflow-hidden bg-slate-50">
                        {thumbnailFile ? (
                          <img
                            src={URL.createObjectURL(thumbnailFile)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                        ) : (
                          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG, WebP, GIF. Max 5MB.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gallery images</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) setGalleryFiles((prev) => [...prev, ...files]);
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-2 border border-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-signal-red file:text-white file:text-sm file:font-semibold hover:file:bg-signal-red/90 file:cursor-pointer focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                    />
                    {(galleryUrls.length > 0 || galleryFiles.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {galleryUrls.map((url, i) => (
                          <div key={url} className="w-16 h-12 border border-slate-200 overflow-hidden bg-slate-50 relative">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setGalleryUrls((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs leading-none flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {galleryFiles.map((f, i) => (
                          <div key={`${f.name}-${i}`} className="w-16 h-12 border border-slate-200 overflow-hidden bg-slate-50 relative">
                            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                            <button
                              type="button"
                              onClick={() => setGalleryFiles((p) => p.filter((_, j) => j !== i))}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs leading-none flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-slate-500">Multiple images for showcase. Max 10, 5MB each.</p>
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
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Long description (Markdown)</label>
                    <textarea
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-y font-mono"
                      placeholder="Full description, headings, bullet points..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Features (one per line)</label>
                    <textarea
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none font-mono"
                      placeholder="Modern Design\nFully Responsive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none"
                      placeholder="e.g. IE Global"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Page names (one per line)</label>
                    <textarea
                      value={pageNamesText}
                      onChange={(e) => setPageNamesText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-signal-red/20 focus:border-signal-red outline-none resize-none font-mono"
                      placeholder="Home\nAbout\nBlog\nContact"
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
