'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type HeroProps = {
  eyebrow?: string;
  /** When set, eyebrow becomes a link (e.g. for service pages: href="/services", "Digital systems") */
  eyebrowLink?: { href: string; label: string };
  title: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundPattern?: 'gradient' | 'mesh' | 'none';
  /** Optional background image (path from public, e.g. /pexels-xxx.jpg). Use with imageOverlay for text contrast. */
  backgroundImage?: string;
  /** Overlay over background image (e.g. bg-black/60). Defaults to bg-black/50 when backgroundImage is set. */
  imageOverlay?: string;
  className?: string;
};

export default function Hero({
  eyebrow,
  eyebrowLink,
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  backgroundPattern = 'gradient',
  backgroundImage,
  imageOverlay,
  className,
}: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const getBackgroundClass = () => {
    switch (backgroundPattern) {
      case 'gradient':
        return 'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900';
      case 'mesh':
        return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-navy-900 via-navy-800 to-signal-red/20';
      default:
        return 'bg-navy-900';
    }
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden text-white',
        !backgroundImage && getBackgroundClass(),
        className
      )}
    >
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className={cn('absolute inset-0', imageOverlay ?? 'bg-black/50')} />
        </>
      )}
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('/grid-pattern.svg')" }} />

      <div className="container-wide relative z-10">
        <motion.div
          className="max-w-5xl py-24 md:py-32 lg:py-40"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {eyebrow && (
            <motion.div variants={itemVariants}>
              {eyebrowLink ? (
                <Link
                  href={eyebrowLink.href}
                  className="inline-block px-4 py-2 text-sm font-semibold bg-white/10 text-white mb-6 tracking-wide uppercase hover:bg-white/20 transition-colors"
                >
                  {eyebrowLink.label}
                </Link>
              ) : (
                <span className="inline-block px-4 py-2 text-sm font-semibold bg-white/10 text-white mb-6 tracking-wide uppercase">
                  {eyebrow}
                </span>
              )}
            </motion.div>
          )}

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            {primaryCTA && (
              <Link href={primaryCTA.href} className="btn-primary">
                {primaryCTA.text}
              </Link>
            )}
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold bg-transparent text-white border-2 border-white rounded-none transition-all duration-200 hover:bg-white hover:text-navy-900 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                {secondaryCTA.text}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 0.5,
        }}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}

