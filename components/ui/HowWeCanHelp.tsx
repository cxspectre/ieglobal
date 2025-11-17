'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const scenarios = [
  {
    number: '01',
    title: 'You need to build something new',
    tagline: 'From concept to launch',
    description: 'Website, platform, or app—designed for speed, clarity, and long-term scalability. We bring product thinking and modern engineering from day one.',
    cta: {
      text: 'Websites & Platforms',
      href: '/services/websites-and-platforms',
    },
  },
  {
    number: '02',
    title: 'Your systems need to run faster',
    tagline: 'Performance optimization',
    description: 'Slow pages, bottlenecks, confusing workflows. We diagnose, optimize, and rebuild where needed—without disrupting the business.',
    cta: {
      text: 'Performance & Reliability',
      href: '/services/cloud-and-security',
    },
  },
  {
    number: '03',
    title: 'Your tools need to work together',
    tagline: 'Integration & automation',
    description: 'Disconnected platforms, manual exports, unclear data paths. We integrate your systems and automate your workflows.',
    cta: {
      text: 'Data, AI & Automation',
      href: '/services/data-ai-automation',
    },
  },
  {
    number: '04',
    title: 'You need a long-term partner',
    tagline: 'Ongoing support',
    description: 'Not short-term freelancers or one-off agencies. A strategic partner who maintains, improves, and evolves your systems as you grow.',
    cta: {
      text: 'Ongoing Support',
      href: '/services/ongoing-support',
    },
  },
];

export default function HowWeCanHelp() {
  return (
    <section className="section bg-white">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-4xl mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
            How We Can Help
          </h2>
          <p className="text-xl text-slate-700">
            We support companies at all stages—from first build to global scale.
          </p>
        </div>

        {/* Scenarios - Stacked with alternating emphasis */}
        <div className="max-w-5xl mx-auto space-y-0">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group py-12 border-b border-gray-100 last:border-b-0"
            >
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Number */}
                <div className="col-span-2">
                  <span className="text-6xl font-bold font-mono text-signal-red/30 group-hover:text-signal-red transition-colors duration-300">
                    {scenario.number}
                  </span>
                </div>

                {/* Content */}
                <div className="col-span-10">
                  <span className="inline-block text-xs font-semibold text-signal-red uppercase tracking-wide mb-3">
                    {scenario.tagline}
                  </span>
                  <h3 className="text-3xl font-bold mb-4 text-navy-900">
                    {scenario.title}
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-6 max-w-3xl">
                    {scenario.description}
                  </p>
                  <Link
                    href={scenario.cta.href}
                    className="inline-flex items-center gap-2 text-base font-semibold text-signal-red hover:gap-3 transition-all duration-200 group/link"
                  >
                    <span>{scenario.cta.text}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Proof Metric */}
        <div className="text-center mt-20 pt-12 border-t border-gray-200 max-w-4xl mx-auto">
          <p className="text-xl font-semibold text-navy-900">
            98% of our projects become ongoing partnerships.
          </p>
        </div>
      </div>
    </section>
  );
}
