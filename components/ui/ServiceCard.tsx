'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ServiceCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  index?: number;
  className?: string;
};

export default function ServiceCard({
  title,
  description,
  href,
  icon,
  index = 0,
  className,
}: ServiceCardProps) {
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
        <div className="card card-glow p-8 h-full flex flex-col border-l-4 border-transparent hover:border-signal-red">
          {icon && (
            <div className="mb-6 text-signal-red">
              {icon}
            </div>
          )}

          <h3 className="text-2xl font-bold text-navy-900 mb-4 group-hover:text-signal-red transition-colors duration-200">
            {title}
          </h3>

          <p className="text-slate-700 mb-6 flex-grow leading-relaxed">
            {description}
          </p>

          <div className="flex items-center text-signal-red font-semibold group-hover:translate-x-2 transition-transform duration-200">
            <span>Learn more</span>
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
      </Link>
    </motion.div>
  );
}

