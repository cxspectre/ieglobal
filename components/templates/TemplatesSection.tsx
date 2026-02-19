'use client';

import { useState, useMemo } from 'react';
import { TemplateGrid } from './TemplateGrid';
import type { WebsiteTemplate } from '@/lib/website-templates';

type TemplatesSectionProps = {
  templates: WebsiteTemplate[];
};

function filterTemplates(
  templates: WebsiteTemplate[],
  search: string,
  category: string
): WebsiteTemplate[] {
  const q = search.trim().toLowerCase();
  const byCategory =
    !category || category === 'All'
      ? templates
      : templates.filter((t) => t.category === category);
  if (!q) return byCategory;
  return byCategory.filter((t) => {
    const name = (t.name || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    const slug = (t.slug || '').toLowerCase();
    return (
      name.includes(q) ||
      desc.includes(q) ||
      cat.includes(q) ||
      slug.includes(q)
    );
  });
}

export function TemplatesSection({ templates }: TemplatesSectionProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, [templates]);

  const filtered = useMemo(
    () => filterTemplates(templates, search, category),
    [templates, search, category]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Side menu / filters */}
      <aside className="lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-11 pr-4 py-3 rounded-none border-2 border-slate-200 bg-white text-navy-900 placeholder:text-slate-400 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
              aria-label="Search templates"
            />
          </div>

          <nav aria-label="Filter by category">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Category
            </h3>
            <ul className="space-y-0">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-4 -ml-[2px] ${
                      category === cat
                        ? 'border-signal-red text-signal-red bg-signal-red/5'
                        : 'border-transparent text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-6">
          Showing {filtered.length} of {templates.length} template
          {templates.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 bg-slate-50">
            <svg
              className="w-12 h-12 text-slate-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="font-semibold text-navy-900 mb-1">No templates match</p>
            <p className="text-sm text-slate-600">
              Try a different search or category filter.
            </p>
          </div>
        ) : (
          <TemplateGrid templates={filtered} />
        )}
      </div>
    </div>
  );
}
