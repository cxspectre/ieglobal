'use client';

import { motion } from 'framer-motion';

type AnimatedContentProps = {
  content: string;
};

export default function AnimatedContent({ content }: AnimatedContentProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="case-study-content
        [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-signal-red [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:mb-8 [&>h2]:mt-20 first:[&>h2]:mt-0
        [&>h3]:text-3xl [&>h3]:font-bold [&>h3]:text-navy-900 [&>h3]:mb-6 [&>h3]:mt-12
        [&>h4]:text-xl [&>h4]:font-bold [&>h4]:text-navy-900 [&>h4]:mb-4 [&>h4]:mt-8
        [&>p]:text-lg [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-6
        [&>ul]:my-6 [&>ul]:space-y-4 [&>ul]:ml-0
        [&>li]:text-slate-700 [&>li]:text-base [&>li]:leading-relaxed [&>li]:pl-8 [&>li]:relative
        [&>li]:before:content-['•'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-signal-red [&>li]:before:font-bold [&>li]:before:text-xl
        [&>strong]:text-navy-900 [&>strong]:font-bold
        [&>a]:text-signal-red [&>a]:font-semibold [&>a]:no-underline hover:[&>a]:underline
        [&>hr]:my-16 [&>hr]:border-gray-200"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

