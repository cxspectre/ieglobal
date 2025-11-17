'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const scenarios = [
  {
    number: '01',
    title: 'Build something new',
    description: 'Website, platform, or app—designed for speed, clarity, and long-term scalability.',
    cta: {
      text: 'Websites & Platforms',
      href: '/services/websites-and-platforms',
    },
  },
  {
    number: '02',
    title: 'Run faster and smoother',
    description: 'Slow pages, bottlenecks, confusing workflows—we diagnose, optimize, and rebuild where needed.',
    cta: {
      text: 'Performance & Reliability',
      href: '/services/cloud-and-security',
    },
  },
  {
    number: '03',
    title: 'Connect tools and data',
    description: 'Disconnected platforms, manual exports, unclear data paths—we integrate your systems and automate workflows.',
    cta: {
      text: 'Data, AI & Automation',
      href: '/services/data-ai-automation',
    },
  },
  {
    number: '04',
    title: 'Partner for the long term',
    description: 'Not short-term freelancers. A strategic partner who maintains, improves, and evolves your systems.',
    cta: {
      text: 'Ongoing Support',
      href: '/services/ongoing-support',
    },
  },
];

export default function HowWeCanHelp() {
  return (
    <section className="section bg-off-white">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
            How We Can Help
          </h2>
          <p className="text-xl text-slate-700">
            We support companies at all stages—from first build to global scale.
          </p>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white p-10 border-l-4 border-transparent hover:border-signal-red transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <span className="text-5xl font-bold font-mono text-signal-red/20 group-hover:text-signal-red transition-colors duration-300">
                  {scenario.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-navy-900 group-hover:text-signal-red transition-colors duration-300">
                    {scenario.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    {scenario.description}
                  </p>
                  <Link
                    href={scenario.cta.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:gap-3 transition-all duration-200"
                  >
                    <span>{scenario.cta.text}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Proof Metric */}
        <div className="text-center pt-12 border-t border-gray-200 max-w-4xl mx-auto">
          <p className="text-lg font-semibold text-navy-900">
            98% of our projects become ongoing partnerships.
          </p>
        </div>
      </div>
    </section>
  );
}
