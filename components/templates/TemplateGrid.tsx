'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import type { WebsiteTemplate } from '@/lib/website-templates';

type TemplateGridProps = {
  templates: WebsiteTemplate[];
};

export function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {templates.map((template, index) => {
        const href = template.slug ? `/templates/${template.slug}` : null;
        const cardContent = (
          <>
            <div className="relative overflow-hidden border-l-4 border-slate-200 group-hover:border-signal-red transition-colors duration-300 bg-slate-100 aspect-[4/3]">
              {template.thumbnail_url ? (
                <img
                  src={template.thumbnail_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-sm font-semibold text-white">View details →</span>
              </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
              <span className="text-xs font-semibold text-signal-red uppercase tracking-wider mb-2">
                {template.category}
              </span>
              <h3 className="text-xl font-bold text-navy-900 group-hover:text-signal-red transition-colors">
                {template.name}
              </h3>
            </div>
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
              <Link href={href} className="block h-full">
                <div className="card card-glow h-full flex flex-col p-0 overflow-hidden border-l-4 border-transparent hover:border-signal-red">
                  {cardContent}
                </div>
              </Link>
            ) : (
              <div className="card h-full flex flex-col p-0 overflow-hidden">
                {cardContent}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
