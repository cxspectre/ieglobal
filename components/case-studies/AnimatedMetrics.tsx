'use client';

import { motion } from 'framer-motion';

type AnimatedMetricsProps = {
  metrics: string[];
};

export default function AnimatedMetrics({ metrics }: AnimatedMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-white p-8 text-center border-l-4 border-signal-red shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="text-4xl font-bold text-signal-red mb-3">✓</div>
          <p className="text-base font-semibold text-navy-900 leading-snug">
            {metric}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

