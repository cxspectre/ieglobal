'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import HeroCarousel from '@/components/ui/HeroCarousel';
import HowWeCanHelp from '@/components/ui/HowWeCanHelp';
import MeetTheFounders from '@/components/ui/MeetTheFounders';
import TemplateRequestModal from '@/components/ui/TemplateRequestModal';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations('home');
  const [heroIsDark, setHeroIsDark] = useState(true);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const heroSlides = [
    {
      eyebrow: t('hero.strategy.eyebrow'),
      title: t('hero.strategy.title'),
      subtitle: t('hero.strategy.subtitle'),
      primaryCTA: { text: t('hero.strategy.cta'), href: '/the-team' },
      backgroundImage: '/pexels-themob000-28428592.jpg',
      isDark: true,
    },
    {
      eyebrow: t('hero.websites.eyebrow'),
      title: t('hero.websites.title'),
      subtitle: t('hero.websites.subtitle'),
      primaryCTA: { text: t('hero.websites.cta'), href: '/case-studies' },
      backgroundImage: '/finger-pointing-at-javascript-code.jpg',
      imageOverlay: 'bg-black/70',
      isDark: true,
    },
    {
      eyebrow: t('hero.data.eyebrow'),
      title: t('hero.data.title'),
      subtitle: t('hero.data.subtitle'),
      primaryCTA: { text: t('hero.data.cta'), href: '/services/data-ai-automation' },
      backgroundImage: '/pexels-pachon-in-motion-426015731-30547584.jpg',
      isDark: true,
    },
    {
      eyebrow: t('hero.partnership.eyebrow'),
      title: t('hero.partnership.title'),
      subtitle: t('hero.partnership.subtitle'),
      primaryCTA: { text: t('hero.partnership.cta'), href: '/contact' },
      backgroundImage: '/portrait-of-illuminated-laptop.jpg',
      isDark: true,
    },
  ];

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} autoPlayInterval={6500} onSlideChange={setHeroIsDark} />

      {/* We Build Your Website - Bold CTA band */}
      <section className="relative overflow-hidden bg-navy-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-signal-red/10 via-transparent to-transparent" aria-hidden="true" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              {t('weBuildYourWebsite')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('weBuildYourWebsiteDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
              >
                {t('getInTouch')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                {t('requestTemplates')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <TemplateRequestModal isOpen={templateModalOpen} onClose={() => setTemplateModalOpen(false)} />

      {/* What We Do - Built for Performance */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('builtForPerformance')}
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              {t('builtForPerformanceDesc')}
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">{t('buildFast')}</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                {t('buildFastDesc')}
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>{t('exploreDigitalSystems')}</span>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">{t('scaleSmoothly')}</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                {t('scaleSmoothlyDesc')}
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>{t('exploreDigitalSystems')}</span>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">{t('operateReliably')}</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                {t('operateReliablyDesc')}
              </p>
              <Link href="/services" className="inline-flex items-center text-sm font-semibold text-signal-red hover:gap-2 gap-1 transition-all duration-200">
                <span>{t('exploreDigitalSystems')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link href="/case-studies" className="inline-flex items-center text-base font-semibold text-signal-red hover:gap-3 gap-2 transition-all duration-200">
              <span>{t('exploreOurWork')}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Meet the Founders */}
      <MeetTheFounders />

      {/* How We Can Help - Interactive Sidebar Design */}
      <HowWeCanHelp />

      {/* Behind the Code - Visual Strip */}
      <section className="relative overflow-hidden">
        <div className="relative h-64 md:h-80 w-full">
          <Image
            src="/pexels-markusspiske-1089438.jpg"
            alt="Code and data in motion—where systems come to life"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-navy-900/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl md:text-2xl font-bold text-white text-center max-w-2xl px-6">
              {t('behindTheCode')}
            </p>
          </div>
        </div>
      </section>

      {/* Measurable Outcomes */}
      <section className="section bg-white">
        <div className="container-wide">
          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            {/* Left: Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
                {t('measurableOutcomes')}
              </h2>
              <p className="text-2xl text-navy-900 mb-6 leading-tight">
                {t('measurableOutcomesLead')}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                {t('measurableOutcomesDesc')}
              </p>
              <Link 
                href="/case-studies" 
                className="inline-flex items-center gap-2 text-base font-semibold text-signal-red hover:gap-3 transition-all duration-200"
              >
                <span>{t('viewCaseStudies')}</span>
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
                  {t('fasterLoadTimes')}
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
                  {t('conversionIncrease')}
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
                  {t('uptimeAchieved')}
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
                  {t('costReduction')}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="text-center mt-20 max-w-2xl mx-auto">
            <p className="text-xl font-semibold text-navy-900">
              {t('performanceGains')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide">
          <div className="max-w-4xl mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('recentWork')}
            </h2>
            <p className="text-xl text-gray-200">
              {t('recentWorkDesc')}
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
                <span>{t('viewProject')}</span>
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
                <span>{t('viewProject')}</span>
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
                <span>{t('viewProject')}</span>
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
                <span>{t('viewProject')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="text-center mt-16">
            <Link href="/case-studies" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-all duration-200 group">
              <span>{t('viewAllWork')}</span>
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
            {t('ctaTitle')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('ctaDesc')}
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            {t('startConversation')}
          </Link>
        </div>
      </section>

    </>
  );
}

