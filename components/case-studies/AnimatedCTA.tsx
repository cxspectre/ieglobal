'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AnimatedCTA() {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold mb-8"
      >
        Want results like this?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-xl text-gray-200 mb-12 leading-relaxed"
      >
        Let's build something that creates momentum for your business.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group text-lg">
          <span>Start a Conversation</span>
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </motion.div>
    </>
  );
}

