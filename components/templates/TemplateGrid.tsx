'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WebsiteTemplate } from '@/lib/website-templates';

type TemplateGridProps = {
  templates: WebsiteTemplate[];
};

export function TemplateGrid({ templates }: TemplateGridProps) {
  const [selected, setSelected] = useState<WebsiteTemplate | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
          >
            <button
              type="button"
              onClick={() => setSelected(template)}
              className="w-full text-left block"
            >
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-[4/3] mb-3 group-hover:border-slate-300 group-hover:shadow-lg transition-all duration-300">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-sm font-semibold text-white">View details</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-signal-red uppercase tracking-wider">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy-900 mt-1 group-hover:text-signal-red transition-colors">
                {template.name}
              </h3>
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200"
            >
              <div className="relative">
                {selected.thumbnail_url ? (
                  <div className="aspect-video w-full rounded-t-2xl overflow-hidden bg-slate-100">
                    <img
                      src={selected.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-t-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg className="w-20 h-20 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg text-slate-600 hover:text-navy-900 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-signal-red uppercase tracking-wider">
                  {selected.category}
                </span>
                <h2 className="text-2xl font-bold text-navy-900 mt-2">{selected.name}</h2>
                {selected.description && (
                  <p className="text-slate-600 mt-3 leading-relaxed">{selected.description}</p>
                )}
                <a
                  href={selected.template_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-colors"
                >
                  Open template in new tab
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
