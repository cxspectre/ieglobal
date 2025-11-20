'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

const services = [
  {
    title: 'Strategy & Direction',
    tagline: 'Clarity first, code second',
    description: 'Digital audits, roadmapping, and product strategy. We define the right solution before building anything.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/services/strategy-and-direction',
  },
  {
    title: 'Websites & Platforms',
    tagline: 'Fast, modern, scalable',
    description: 'Next.js websites, web apps, and SaaS platforms engineered for performance and growth.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    href: '/services/websites-and-platforms',
  },
  {
    title: 'Mobile Apps',
    tagline: 'Native feel, unified code',
    description: 'React Native apps for iOS and Android with secure cloud connectivity and offline support.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    href: '/services/mobile',
  },
  {
    title: 'Cloud & Security',
    tagline: 'Fast, online, secure',
    description: 'Scalable cloud architecture, serverless deployments, monitoring, and robust security.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    href: '/services/cloud-and-security',
  },
  {
    title: 'Data & AI',
    tagline: 'Smarter systems',
    description: 'Integrations, AI workflows, automation, dashboards, and analytics that reduce manual work.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    href: '/services/data-ai-automation',
  },
  {
    title: 'Growth & Marketing',
    tagline: 'Visible performance',
    description: 'SEO, performance optimization, conversion tracking, and campaign activation.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    href: '/services/growth-and-marketing',
  },
  {
    title: 'Ongoing Support',
    tagline: 'Long-term partnership',
    description: 'Maintenance, performance reviews, security updates, and continuous improvement.',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/services/ongoing-support',
  },
];

export default function ServicesPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      <Hero
        eyebrow="Services"
        title="Built for Performance"
        subtitle="Seven ways we help you build, scale, and sustain digital systems."
        backgroundPattern="gradient"
      />

      {/* Services Grid - Interactive */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Link
                key={index}
                href={service.href}
                className="group relative block bg-off-white p-10 md:p-12 hover:bg-navy-900 transition-all duration-500 overflow-hidden min-h-[400px] flex flex-col"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon */}
                <div className="mb-8 text-signal-red group-hover:text-white transition-colors duration-500">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-navy-900 group-hover:text-white transition-colors duration-500">
                  {service.title}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-signal-red group-hover:text-signal-red/90 font-semibold mb-6 transition-colors duration-500">
                  {service.tagline}
                </p>

                {/* Description */}
                <p className="text-base text-slate-700 group-hover:text-gray-300 leading-relaxed mb-auto transition-colors duration-500">
                  {service.description}
                </p>

                {/* Arrow */}
                <div className="mt-8 flex items-center gap-2 text-signal-red group-hover:text-white transition-all duration-300">
                  <span className="text-sm font-semibold">Learn more</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-signal-red/0 to-signal-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not sure where to start?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Let's talk about your goals. We'll help you find the right approach.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
            <span>Start a Conversation</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
