'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import type { WebsiteTemplate } from '@/lib/website-templates';

type TemplateGridProps = {
  templates: WebsiteTemplate[];
};

export function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template, index) => {
        const href = template.slug ? `/templates/${template.slug}` : null;
        const cardContent = (
          <>
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
          </>
        );

        return (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
          >
            {href ? (
              <Link href={href} className="block w-full text-left">
                {cardContent}
              </Link>
            ) : (
              <div className="w-full text-left">{cardContent}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
