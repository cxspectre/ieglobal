'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type CaseStudyCardProps = {
  title: string;
  summary: string;
  client: string;
  industry: string;
  outcome: string;
  href: string;
  coverImage?: string;
  metrics?: string[];
  index?: number;
  className?: string;
};

export default function CaseStudyCard({
  title,
  summary,
  client,
  industry,
  outcome,
  href,
  coverImage,
  metrics,
  index = 0,
  className,
}: CaseStudyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={cn('group', className)}
    >
      <Link href={href} className="block h-full">
        <div className="card overflow-hidden h-full flex flex-col">
          {coverImage && (
            <div className="relative h-64 bg-navy-900 overflow-hidden">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                  {industry}
                </span>
              </div>
            </div>
          )}

          <div className="p-8 flex-grow flex flex-col">
            <div className="mb-4">
              <span className="text-sm font-semibold text-signal-red uppercase tracking-wide">
                {client}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-navy-900 mb-4 group-hover:text-signal-red transition-colors duration-200">
              {title}
            </h3>

            <p className="text-slate-700 mb-6 leading-relaxed">
              {summary}
            </p>

            {metrics && metrics.length > 0 && (
              <div className="mb-6 space-y-2">
                {metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="flex items-center text-sm text-navy-900 font-semibold"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-signal-red"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {metric}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto">
              <div className="flex items-center text-signal-red font-semibold group-hover:translate-x-2 transition-transform duration-200">
                <span>Read case study</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

