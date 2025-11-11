'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type MetricCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
  duration?: number;
  index?: number;
  className?: string;
};

export default function MetricCounter({
  value,
  suffix = '',
  prefix = '',
  label,
  description,
  duration = 2,
  index = 0,
  className,
}: MetricCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={cn('text-center', className)}
    >
      <div className="mb-4">
        <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 font-mono">
          {prefix}
          <motion.span>{display}</motion.span>
          {suffix}
        </span>
      </div>

      <div className="text-lg md:text-xl font-semibold text-slate-700 mb-2">
        {label}
      </div>

      {description && (
        <p className="text-sm text-slate-700 max-w-xs mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  );
}

