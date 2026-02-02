'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HowWeCanHelp() {
  const locale = useLocale();
  const isDe = locale === 'de';

  const scenarios = [
    {
      key: 'build',
      title: isDe ? 'Aufbauen' : 'Build',
      subtitle: isDe ? 'Neu starten' : 'Starting from scratch',
      description: isDe
        ? 'Wir entwickeln performante Websites, Plattformen und Apps – klar, schnell und wachstumsorientiert.'
        : 'Create high-performance websites, platforms, and apps designed for clarity and growth.',
      href: '/services/websites-and-platforms',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      key: 'optimize',
      title: isDe ? 'Optimieren' : 'Optimize',
      subtitle: isDe ? 'Bestehendes verbessern' : 'Improve what exists',
      description: isDe
        ? 'Wir finden Engpässe, erhöhen die Geschwindigkeit und machen Systeme skalierbar – ohne den Betrieb zu stören.'
        : 'Diagnose bottlenecks, increase speed, and rebuild for scale—without disrupting operations.',
      href: '/services/cloud-and-security',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: 'integrate',
      title: isDe ? 'Integrieren' : 'Integrate',
      subtitle: isDe ? 'Systeme verbinden' : 'Connect your systems',
      description: isDe
        ? 'Wir vereinen Plattformen, automatisieren Abläufe und ermöglichen datengetriebene Entscheidungen über alle Tools hinweg.'
        : 'Unify platforms, automate workflows, and enable data-driven decisions across tools.',
      href: '/services/data-ai-automation',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'sustain',
      title: isDe ? 'Begleiten' : 'Sustain',
      subtitle: isDe ? 'Langfristige Partnerschaft' : 'Long-term partnership',
      description: isDe
        ? 'Laufende Optimierung, neue Features und strategische Unterstützung beim Skalieren.'
        : 'Ongoing optimization, feature development, and strategic support as you scale.',
      href: '/services/ongoing-support',
      icon: (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-off-white">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
            {isDe ? 'Wie wir Sie unterstützen' : 'How We Can Help'}
          </h2>
          <p className="text-xl text-slate-700">
            {isDe ? 'Vier Wege, wie wir Ihr Wachstum unterstützen' : 'Four ways we support your growth'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 max-w-7xl mx-auto">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={scenario.href}
                className="group block bg-white h-full p-10 hover:bg-navy-900 transition-all duration-500 relative overflow-hidden"
              >
                {/* Icon */}
                <div className="mb-8 text-signal-red group-hover:text-white transition-colors duration-500">
                  {scenario.icon}
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold mb-2 text-navy-900 group-hover:text-white transition-colors duration-500">
                  {scenario.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-slate-700 group-hover:text-gray-300 mb-4 transition-colors duration-500">
                  {scenario.subtitle}
                </p>

                {/* Description */}
                <p className="text-base text-slate-700 group-hover:text-gray-200 leading-relaxed mb-6 transition-colors duration-500">
                  {scenario.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-signal-red group-hover:text-white transition-all duration-300">
                  <span className="text-sm font-semibold">
                    {isDe ? 'Mehr erfahren' : 'Learn more'}
                  </span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-signal-red/0 to-signal-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Proof Metric */}
        <div className="text-center mt-20">
          <p className="text-xl font-semibold text-navy-900">
            {isDe
              ? '98 % unserer Projekte werden zu langfristigen Partnerschaften'
              : '98% of our projects become ongoing partnerships'}
          </p>
        </div>
      </div>
    </section>
  );
}
