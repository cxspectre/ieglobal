'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

const services = [
  {
    number: '01',
    title: 'Strategy & Direction',
    tagline: 'Clarity first, code second',
    description: 'Digital audits, technical assessments, platform roadmapping, and product strategy. We define the right problem before writing a single line of code.',
    features: ['Technical Assessments', 'Product Roadmaps', 'Feature Prioritization'],
    href: '/services/strategy-and-direction',
    gradient: 'from-navy-900 via-navy-800 to-navy-900',
  },
  {
    number: '02',
    title: 'Websites & Platforms',
    tagline: 'Built for speed and scale',
    description: 'Marketing websites, web apps, customer portals, and SaaS platforms. High-performance systems designed to grow with your business.',
    features: ['Next.js Development', 'Performance Optimization', 'Scalable Architecture'],
    href: '/services/websites-and-platforms',
    gradient: 'from-navy-900 via-purple-900/30 to-navy-800',
  },
  {
    number: '03',
    title: 'Mobile & Cross-Platform',
    tagline: 'Native performance everywhere',
    description: 'iOS and Android apps with React Native. Secure authentication, offline sync, and cloud connectivity.',
    features: ['React Native Apps', 'iOS & Android', 'Cloud Integration'],
    href: '/services/mobile',
    gradient: 'from-navy-900 via-blue-900/30 to-navy-800',
  },
  {
    number: '04',
    title: 'Cloud & Security',
    tagline: 'Fast. Online. Secure.',
    description: 'Vercel, AWS, and Azure architecture. Serverless deployments, monitoring, observability, and access controls.',
    features: ['Cloud Architecture', 'Serverless & Edge', 'Security & Monitoring'],
    href: '/services/cloud-and-security',
    gradient: 'from-navy-900 via-slate-800 to-navy-900',
  },
  {
    number: '05',
    title: 'Data, AI & Automation',
    tagline: 'Smarter systems, less work',
    description: 'API integrations, AI-powered workflows, intelligent features, dashboards, and real-time analytics.',
    features: ['System Integrations', 'AI Workflows', 'Real-time Analytics'],
    href: '/services/data-ai-automation',
    gradient: 'from-navy-900 via-red-900/20 to-navy-800',
  },
  {
    number: '06',
    title: 'Growth & Marketing',
    tagline: 'Performance is visible',
    description: 'SEO, web performance optimization, conversion tracking, attribution, and campaign activation.',
    features: ['SEO & Performance', 'Conversion Tracking', 'Growth Analytics'],
    href: '/services/growth-and-marketing',
    gradient: 'from-navy-900 via-orange-900/20 to-navy-800',
  },
  {
    number: '07',
    title: 'Ongoing Support',
    tagline: 'We evolve with you',
    description: 'Maintenance, upgrades, performance reviews, security updates, and continuous feature development.',
    features: ['Continuous Optimization', 'Feature Evolution', 'Long-term Partnership'],
    href: '/services/ongoing-support',
    gradient: 'from-navy-900 via-teal-900/20 to-navy-800',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Engineering That Drives Growth"
        subtitle="Seven capabilities. One unified approach. Systems built to last."
        backgroundPattern="mesh"
      />

      {/* Services - Full Screen Sections */}
      {services.map((service, index) => (
        <section
          key={service.number}
          className={`relative min-h-screen flex items-center bg-gradient-to-br ${service.gradient} text-white`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 bg-[url('/grid-pattern.svg')]" />
          
          <div className="container-wide relative z-10 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}
              >
                <div className="text-7xl md:text-8xl lg:text-9xl font-bold font-mono text-white/10 mb-6">
                  {service.number}
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  {service.title}
                </h2>
                
                <p className="text-xl md:text-2xl text-signal-red mb-8 font-semibold">
                  {service.tagline}
                </p>
                
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-10">
                  {service.description}
                </p>

                <Link
                  href={service.href}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-signal-red hover:text-white transition-all duration-300 group"
                >
                  <span>Explore This Service</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>

              {/* Right: Features Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}
              >
                <div className="space-y-4">
                  {service.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6 + (i * 0.1) }}
                      className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="w-2 h-2 bg-signal-red rounded-full flex-shrink-0" />
                      <span className="text-lg font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          {index < services.length - 1 && (
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            >
              <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          )}
        </section>
      ))}

      {/* CTA - Final Section */}
      <section className="relative min-h-[60vh] flex items-center bg-signal-red text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-signal-red via-red-600 to-signal-red opacity-90" />
        <div className="container-wide text-center relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              Ready to Build Something Exceptional?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Let's talk about your goals and challenges. We'll help you find the right path forward.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-signal-red font-semibold hover:bg-navy-900 hover:text-white transition-all duration-300 group text-lg">
              <span>Start a Conversation</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
