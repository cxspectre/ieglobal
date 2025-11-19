'use client';

import { motion } from 'framer-motion';

type AnimatedChallengeProps = {
  challenge: string;
};

export default function AnimatedChallenge({ challenge }: AnimatedChallengeProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="text-3xl text-navy-900 font-bold leading-tight"
    >
      {challenge}
    </motion.p>
  );
}

