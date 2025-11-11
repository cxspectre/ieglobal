'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const scenarios = [
  {
    id: 1,
    title: 'Build something new',
    problem: 'You need to create a website, platform, or app from scratch',
    solution: 'We design and develop digital experiences built for speed, clarity, and long-term scalability.',
    details: [
      'Product thinking and modern engineering from day one',
      'Performance-first architecture',
      'Scalable foundations that grow with you',
    ],
    cta: {
      text: 'See Websites & Platforms',
      href: '/services/websites-and-platforms',
    },
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Run faster and smoother',
    problem: 'Your systems are slow, bottlenecked, or hard to maintain',
    solution: 'We diagnose, optimize, and rebuild where needed—without disrupting your business.',
    details: [
      'Performance audits and optimization',
      'Cloud architecture and scaling',
      'Monitoring and reliability engineering',
    ],
    cta: {
      text: 'Performance & Reliability',
      href: '/services/cloud-and-security',
    },
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Connect tools and data',
    problem: 'Disconnected platforms, manual work, unclear data flows',
    solution: 'We integrate your systems, automate workflows, and enable real-time insights.',
    details: [
      'API integrations and middleware',
      'Workflow automation with AI',
      'Unified dashboards and reporting',
    ],
    cta: {
      text: 'Data, AI & Automation',
      href: '/services/data-ai-automation',
    },
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Partner for the long term',
    problem: 'You need ongoing support, not a one-time engagement',
    solution: 'We maintain, improve, and evolve your systems as your business grows.',
    details: [
      'Continuous performance optimization',
      'Feature development and iterations',
      'Strategic technology partnership',
    ],
    cta: {
      text: 'Ongoing Support',
      href: '/services/ongoing-support',
    },
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function HowWeCanHelp() {
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <section className="section bg-white">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How We Can Help
          </h2>
          <p className="text-xl text-slate-700">
            We support companies at all stages—from first build to global scale.
          </p>
        </div>

        {/* Interactive Layout */}
        <div className="grid grid-cols-12 gap-0 max-w-7xl mx-auto bg-off-white">
          {/* Left: Scenario Selector */}
          <div className="col-span-5 bg-navy-900 p-12">
            <div className="space-y-2">
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenario(index)}
                  className={`w-full text-left p-4 transition-all duration-300 rounded-sm group ${
                    activeScenario === index
                      ? 'bg-signal-red text-white'
                      : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex-shrink-0 ${
                      activeScenario === index ? 'text-white' : 'text-white/60'
                    }`}>
                      {scenario.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-lg font-bold mb-1 ${
                        activeScenario === index ? 'text-white' : ''
                      }`}>
                        {scenario.title}
                      </div>
                      <div className={`text-sm ${
                        activeScenario === index ? 'text-white/90' : 'text-white/50'
                      }`}>
                        {scenario.problem}
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        activeScenario === index ? 'translate-x-1' : ''
                      }`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Solution Details */}
          <div className="col-span-7 bg-white p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <span className="inline-block px-4 py-1 bg-signal-red/10 text-signal-red text-xs font-semibold uppercase tracking-wide">
                    Solution
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-navy-900 mb-6">
                  {scenarios[activeScenario].title}
                </h3>

                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  {scenarios[activeScenario].solution}
                </p>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-4">
                    What we deliver
                  </h4>
                  <ul className="space-y-3">
                    {scenarios[activeScenario].details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={scenarios[activeScenario].cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group"
                >
                  <span>{scenarios[activeScenario].cta.text}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Proof Metric */}
        <div className="text-center mt-16">
          <p className="text-lg font-semibold text-navy-900">
            98% of our projects become ongoing partnerships.
          </p>
        </div>
      </div>
    </section>
  );
}

