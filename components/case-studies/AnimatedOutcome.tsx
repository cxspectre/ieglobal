'use client';

import { motion } from 'framer-motion';

type AnimatedOutcomeProps = {
  outcome: string;
};

export default function AnimatedOutcome({ outcome }: AnimatedOutcomeProps) {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-sm font-bold text-white/80 uppercase tracking-wider mb-6"
      >
        The Outcome
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-3xl md:text-5xl font-bold text-white leading-tight"
      >
        {outcome}
      </motion.p>
    </>
  );
}

