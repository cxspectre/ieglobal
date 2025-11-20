'use client';

import { useState } from 'react';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Strategy & Direction',
    tagline: 'Clarity before code',
    href: '/services/strategy-and-direction',
  },
  {
    title: 'Websites & Platforms',
    tagline: 'Built for performance',
    href: '/services/websites-and-platforms',
  },
  {
    title: 'Mobile Apps',
    tagline: 'Native everywhere',
    href: '/services/mobile',
  },
  {
    title: 'Cloud & Security',
    tagline: 'Fast. Safe. Reliable.',
    href: '/services/cloud-and-security',
  },
  {
    title: 'Data & AI',
    tagline: 'Smarter systems',
    href: '/services/data-ai-automation',
  },
  {
    title: 'Growth',
    tagline: 'Visible performance',
    href: '/services/growth-and-marketing',
  },
  {
    title: 'Support',
    tagline: 'Long-term partnership',
    href: '/services/ongoing-support',
  },
];

export default function ServicesPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      <Hero
        eyebrow="Services"
        title="What We Build"
        subtitle="From strategy to scale. Engineering that creates momentum."
        backgroundPattern="gradient"
      />

      {/* Bento Grid - Unique Asymmetric Layout */}
      <section className="section bg-white">
        <div className="container-wide max-w-7xl">
          <div className="grid grid-cols-6 gap-4 h-[800px]">
            {/* Large card - Strategy */}
            <Link
              href={services[0].href}
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-6 md:col-span-3 row-span-2 group relative bg-navy-900 p-12 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-signal-red transition-transform duration-700 origin-bottom ${hoveredIndex === 0 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className="text-sm text-white/60 group-hover:text-white mb-3 transition-colors duration-300">{services[0].tagline}</p>
                <h3 className="text-4xl font-bold text-white mb-4">{services[0].title}</h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:gap-3 transition-all duration-200">
                  <span className="text-sm font-semibold">Explore</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Medium cards - Websites & Mobile */}
            <Link
              href={services[1].href}
              onMouseEnter={() => setHoveredIndex(1)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-6 md:col-span-3 group relative bg-off-white p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-navy-900 transition-transform duration-700 origin-bottom ${hoveredIndex === 1 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className={`text-sm mb-3 transition-colors duration-300 ${hoveredIndex === 1 ? 'text-white/60' : 'text-slate-600'}`}>{services[1].tagline}</p>
                <h3 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${hoveredIndex === 1 ? 'text-white' : 'text-navy-900'}`}>{services[1].title}</h3>
                <div className={`flex items-center gap-2 transition-all duration-200 ${hoveredIndex === 1 ? 'text-white/80 gap-3' : 'text-signal-red'}`}>
                  <span className="text-sm font-semibold">Explore</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href={services[2].href}
              onMouseEnter={() => setHoveredIndex(2)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-3 md:col-span-2 group relative bg-navy-900 p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-signal-red transition-transform duration-700 origin-bottom ${hoveredIndex === 2 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className="text-sm text-white/60 group-hover:text-white mb-3 transition-colors duration-300">{services[2].tagline}</p>
                <h3 className="text-2xl font-bold text-white mb-4">{services[2].title}</h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:gap-3 transition-all duration-200">
                  <span className="text-sm font-semibold">→</span>
                </div>
              </div>
            </Link>

            {/* Small cards - Cloud, Data, Growth, Support */}
            <Link
              href={services[3].href}
              onMouseEnter={() => setHoveredIndex(3)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-3 md:col-span-2 group relative bg-off-white p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-navy-900 transition-transform duration-700 origin-bottom ${hoveredIndex === 3 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className={`text-sm mb-3 transition-colors duration-300 ${hoveredIndex === 3 ? 'text-white/60' : 'text-slate-600'}`}>{services[3].tagline}</p>
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${hoveredIndex === 3 ? 'text-white' : 'text-navy-900'}`}>{services[3].title}</h3>
                <div className={`flex items-center gap-2 transition-all duration-200 ${hoveredIndex === 3 ? 'text-white/80 gap-3' : 'text-signal-red'}`}>
                  <span className="text-sm font-semibold">→</span>
                </div>
              </div>
            </Link>

            <Link
              href={services[4].href}
              onMouseEnter={() => setHoveredIndex(4)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-3 md:col-span-2 group relative bg-navy-900 p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-signal-red transition-transform duration-700 origin-bottom ${hoveredIndex === 4 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className="text-sm text-white/60 group-hover:text-white mb-3 transition-colors duration-300">{services[4].tagline}</p>
                <h3 className="text-2xl font-bold text-white mb-4">{services[4].title}</h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:gap-3 transition-all duration-200">
                  <span className="text-sm font-semibold">→</span>
                </div>
              </div>
            </Link>

            <Link
              href={services[5].href}
              onMouseEnter={() => setHoveredIndex(5)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-3 md:col-span-2 group relative bg-off-white p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-navy-900 transition-transform duration-700 origin-bottom ${hoveredIndex === 5 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className={`text-sm mb-3 transition-colors duration-300 ${hoveredIndex === 5 ? 'text-white/60' : 'text-slate-600'}`}>{services[5].tagline}</p>
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${hoveredIndex === 5 ? 'text-white' : 'text-navy-900'}`}>{services[5].title}</h3>
                <div className={`flex items-center gap-2 transition-all duration-200 ${hoveredIndex === 5 ? 'text-white/80 gap-3' : 'text-signal-red'}`}>
                  <span className="text-sm font-semibold">→</span>
                </div>
              </div>
            </Link>

            <Link
              href={services[6].href}
              onMouseEnter={() => setHoveredIndex(6)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="col-span-6 md:col-span-2 group relative bg-navy-900 p-10 flex flex-col justify-end overflow-hidden"
            >
              <div className={`absolute inset-0 bg-signal-red transition-transform duration-700 origin-bottom ${hoveredIndex === 6 ? 'scale-y-100' : 'scale-y-0'}`} />
              <div className="relative z-10">
                <p className="text-sm text-white/60 group-hover:text-white mb-3 transition-colors duration-300">{services[6].tagline}</p>
                <h3 className="text-2xl font-bold text-white mb-4">{services[6].title}</h3>
                <div className="flex items-center gap-2 text-white/80 group-hover:gap-3 transition-all duration-200">
                  <span className="text-sm font-semibold">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Bottom Statement */}
      <section className="py-20 bg-off-white">
        <div className="container-wide text-center">
          <p className="text-2xl md:text-3xl font-bold text-navy-900 mb-8">
            Not sure which service fits your needs?
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
            <span>Let's Talk</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
