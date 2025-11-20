'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroCarousel from '@/components/ui/HeroCarousel';
import HowWeCanHelp from '@/components/ui/HowWeCanHelp';
import Link from 'next/link';

const heroSlides = [
  {
    eyebrow: 'Strategy & Direction',
    title: 'Build the right thing. Not just anything.',
    subtitle: 'We align technology with your business goals, clarify what matters, and design a roadmap you can trust.',
    primaryCTA: {
      text: 'Explore How We Work',
      href: '/about',
    },
    backgroundImage: '/hero-1.png',
    isDark: true,
  },
  {
    eyebrow: 'Websites & Platforms',
    title: 'High-performance digital experiences, built to last.',
    subtitle: 'We design and develop websites, platforms, and internal systems that feel fast, intuitive, and reliable.',
    primaryCTA: {
      text: 'See Our Work',
      href: '/case-studies',
    },
    backgroundImage: '/hero-2.png',
    isDark: true,
  },
  {
    eyebrow: 'Data, AI & Integration',
    title: 'Your systems, finally connected.',
    subtitle: 'We integrate your tools, automate workflows, and apply practical AI - so your business moves smarter, not harder.',
    primaryCTA: {
      text: 'View Services',
      href: '/services/data-ai-automation',
    },
    backgroundImage: '/hero-3.png',
    isDark: true,
  },
  {
    eyebrow: 'Long-Term Partnership',
    title: "We don't just build. We stay.",
    subtitle: 'Ongoing performance reviews, improvements, scaling support, security - a relationship that grows with your business.',
    primaryCTA: {
      text: 'Start a Project',
      href: '/contact',
    },
    backgroundPattern: 'gradient' as const,
    isDark: true,
  },
];

export default function HomePage() {
  const [heroIsDark, setHeroIsDark] = useState(true);

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} autoPlayInterval={6500} onSlideChange={setHeroIsDark} />


      {/* What We Do - Built for Performance */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Performance
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              We design, build, and operate high-performance digital systems—websites, apps, and platforms—engineered to scale smoothly and evolve with your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Build Fast */}
            <div className="group">
              <div className="mb-6">
                <svg className="w-12 h-12 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Build Fast</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We ship modern, intuitive, high-performance experiences that feel fast everywhere—mobile, web, and internal tools included.
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Scale Smoothly */}
            <div className="group">
              <div className="mb-6">
                <svg className="w-12 h-12 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Scale Smoothly</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We architect systems that integrate cleanly and grow with your needs, from APIs and workflows to cloud environments and deployment pipelines.
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Operate Reliably */}
            <div className="group">
              <div className="mb-6">
                <svg className="w-12 h-12 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Operate Reliably</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We stay with you after launch, continuously improving performance, security, and functionality as your business evolves.
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>Learn more</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/case-studies" className="inline-flex items-center text-base font-semibold text-signal-red hover:gap-3 gap-2 transition-all duration-200">
              <span>Explore Our Work</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How We Can Help - Interactive Sidebar Design */}
      <HowWeCanHelp />

      {/* Measurable Outcomes */}
      <section className="section bg-white">
        <div className="container-wide">
          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            {/* Left: Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
                Measurable Outcomes
              </h2>
              <p className="text-2xl text-navy-900 mb-6 leading-tight">
                Engineering isn't just about shipping—it's about impact.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                Your digital systems should create momentum—not friction. We measure success in business outcomes, not just technical metrics.
              </p>
              <Link 
                href="/case-studies" 
                className="inline-flex items-center gap-2 text-base font-semibold text-signal-red hover:gap-3 transition-all duration-200"
              >
                <span>View Case Studies</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right: Metrics Grid */}
            <div className="grid grid-cols-2 gap-1">
              {/* Metric 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0 }}
                className="bg-off-white p-8 text-center group hover:bg-navy-900 transition-all duration-300"
              >
                <div className="text-5xl font-bold font-mono text-signal-red mb-3">
                  43%
                </div>
                <div className="text-sm text-slate-700 group-hover:text-gray-300 transition-colors duration-300">
                  Faster load times
                </div>
              </motion.div>

              {/* Metric 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-off-white p-8 text-center group hover:bg-navy-900 transition-all duration-300"
              >
                <div className="text-5xl font-bold font-mono text-signal-red mb-3">
                  27%
                </div>
                <div className="text-sm text-slate-700 group-hover:text-gray-300 transition-colors duration-300">
                  Conversion increase
                </div>
              </motion.div>

              {/* Metric 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-off-white p-8 text-center group hover:bg-navy-900 transition-all duration-300"
              >
                <div className="text-5xl font-bold font-mono text-signal-red mb-3">
                  99.9%
                </div>
                <div className="text-sm text-slate-700 group-hover:text-gray-300 transition-colors duration-300">
                  Uptime achieved
                </div>
              </motion.div>

              {/* Metric 4 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-off-white p-8 text-center group hover:bg-navy-900 transition-all duration-300"
              >
                <div className="text-5xl font-bold font-mono text-signal-red mb-3">
                  34%
                </div>
                <div className="text-sm text-slate-700 group-hover:text-gray-300 transition-colors duration-300">
                  Cost reduction
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="text-center mt-20 max-w-2xl mx-auto">
            <p className="text-xl font-semibold text-navy-900">
              Performance gains you can feel—and measure.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide">
          <div className="max-w-4xl mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Recent Work
            </h2>
            <p className="text-xl text-gray-200">
              Real projects. Real outcomes. Real impact.
            </p>
          </div>

          {/* Case Study Grid - Minimal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-6xl mx-auto">
            {/* Case 1 */}
            <Link href="/case-studies/consulting-firm-transformation" className="group block bg-white/5 backdrop-blur-sm p-12 hover:bg-white/10 transition-all duration-300 border-r border-b border-white/10">
              <span className="text-xs font-semibold text-signal-red uppercase tracking-wide mb-4 block">
                Professional Services
              </span>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-signal-red transition-colors duration-300">
                Digital transformation for consulting firm
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Modern, high-performance website that elevated trust and improved lead quality.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:gap-3 transition-all duration-200">
                <span>View project</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Case 2 */}
            <Link href="/case-studies/construction-website-rebuild" className="group block bg-white/5 backdrop-blur-sm p-12 hover:bg-white/10 transition-all duration-300 border-b border-white/10">
              <span className="text-xs font-semibold text-signal-red uppercase tracking-wide mb-4 block">
                Construction & Real Estate
              </span>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-signal-red transition-colors duration-300">
                Website rebuild for family construction business
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Fast, mobile-friendly platform that modernized brand presence and improved customer contact flow.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:gap-3 transition-all duration-200">
                <span>View project</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Case 3 */}
            <Link href="/case-studies/youtube-content-system" className="group block bg-white/5 backdrop-blur-sm p-12 hover:bg-white/10 transition-all duration-300 border-r border-white/10">
              <span className="text-xs font-semibold text-signal-red uppercase tracking-wide mb-4 block">
                Content & Growth
              </span>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-signal-red transition-colors duration-300">
                YouTube content system for B2B brand
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Complete video production pipeline, editing workflows, and channel strategy for consistent publishing.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:gap-3 transition-all duration-200">
                <span>View project</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Case 4 */}
            <Link href="/case-studies/school-communication-app" className="group block bg-white/5 backdrop-blur-sm p-12 hover:bg-white/10 transition-all duration-300">
              <span className="text-xs font-semibold text-signal-red uppercase tracking-wide mb-4 block">
                Education Tech
              </span>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-signal-red transition-colors duration-300">
                School communication mobile app (In Development)
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                React Native platform for attendance, alerts, and parent communication—engineered for scale.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:gap-3 transition-all duration-200">
                <span>View project</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="text-center mt-16">
            <Link href="/case-studies" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-all duration-200 group">
              <span>View All Work</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Let's map your 90-day value plan
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Have a complex stack or ambitious growth target? We turn it into a fast, connected, intelligent system.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a conversation
          </Link>
        </div>
      </section>

    </>
  );
}

