'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShowcaseItem } from '@/lib/showcase';

type Props = { items: ShowcaseItem[] };

const AUTO_ADVANCE_MS = 5500;

/** Extract a clean domain for display from a project URL */
function domainFromUrl(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    return host || url;
  } catch {
    return url;
  }
}

export default function ShowcaseView({ items }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const n = items.length;
  const current = n > 0 ? items[(index % n + n) % n] : null;

  const goTo = useCallback((next: number) => {
    setIndex((prev) => {
      const nextIndex = (prev + next + n) % n;
      setDirection(next > 0 ? 1 : -1);
      return nextIndex;
    });
  }, [n]);

  const next = useCallback(() => goTo(1), [goTo]);
  const prev = useCallback(() => goTo(-1), [goTo]);

  useEffect(() => {
    if (n <= 1 || isPaused) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [n, isPaused, next]);

  const handleLeave = async () => {
    await fetch('/api/showcase/unlock?logout=1');
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <>
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 min-h-screen flex flex-col">
          <ShowcaseHeader onLeave={handleLeave} />
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <ShowcaseIntro />
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 md:p-16 text-center mt-12">
              <p className="text-white/30 text-sm font-light">No projects in the showcase yet.</p>
            </section>
          </div>
          <ShowcaseFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <ShowcaseHeader onLeave={handleLeave} />

        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col">
          <ShowcaseIntro />

          <div
            className="relative mt-8 md:mt-12 flex-1 min-h-[280px] md:min-h-[320px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute inset-0 flex items-center">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {current && (
                  <motion.div
                    key={current.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -60 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full"
                  >
                    <a
                      href={current.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden transition-all duration-300 hover:border-amber-500/25 hover:bg-white/[0.06]"
                    >
                      <div className="flex border-l-4 border-amber-500/50 pl-6 pr-6 py-6 md:pl-8 md:pr-8 md:py-8">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-[11px] font-mono text-amber-500/90 tracking-widest tabular-nums">
                              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/40">
                              {current.industry_type}
                            </span>
                          </div>
                          <h2 className="mt-3 text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white group-hover:text-amber-400/95 transition-colors break-all">
                            {domainFromUrl(current.project_url)}
                          </h2>
                          {current.description && (
                            <p className="mt-3 text-white/50 text-sm md:text-base font-light leading-relaxed max-w-2xl">
                              {current.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-3 self-center ml-8 mr-8 md:mr-12 py-2">
                          <span className="text-xs font-medium text-amber-500/80 group-hover:text-amber-400 transition-colors">
                            View website
                          </span>
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500/90 group-hover:border-amber-500/50 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all duration-300">
                            <ArrowIcon className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous project"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-3 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-10"
                >
                  <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next project"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-3 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all z-10"
                >
                  <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 flex items-center gap-2">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                      aria-label={`Go to project ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index
                          ? 'w-6 bg-amber-500/80'
                          : 'w-1.5 bg-white/25 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {n > 1 && (
            <p className="mt-14 text-center text-[10px] font-mono text-white/25">
              Auto-advances every {AUTO_ADVANCE_MS / 1000}s · Pause by hovering
            </p>
          )}
        </div>

        <ShowcaseFooter />
      </div>
    </>
  );
}

function ShowcaseHeader({ onLeave }: { onLeave: () => void }) {
  return (
    <header className="border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400/90">
            <LockIcon className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/40">
            Confidential
          </span>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="text-[10px] font-mono tracking-widest text-white/25 hover:text-white/50 transition-colors"
        >
          Leave
        </button>
      </div>
    </header>
  );
}

function ShowcaseIntro() {
  return (
    <section>
      <p className="text-amber-500/80 text-xs font-medium tracking-[0.25em] uppercase mb-3">
        Selected work
      </p>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-light tracking-tight text-white max-w-2xl">
        Six projects across six industries.
      </h1>
      <p className="mt-3 text-white/35 text-sm md:text-base max-w-lg font-light">
        A curated view — not linked from the main site.
      </p>
    </section>
  );
}

function ShowcaseFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 sm:px-6 lg:px-8 py-4 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/20">This page is not indexed.</span>
        <span className="text-[10px] text-white/15">—</span>
      </div>
    </footer>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
