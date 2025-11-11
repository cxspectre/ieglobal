'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const servicesMenu = [
  {
    category: 'Strategy & Direction',
    description: 'Clarity first, code second.',
    items: [
      'Digital Audits & Technical Assessments',
      'Platform & Workflow Roadmapping',
      'Product Strategy & Feature Prioritization',
    ],
    href: '/services/strategy-and-direction',
  },
  {
    category: 'Websites & Platforms',
    description: 'Built with Next.js for speed, security, and sustainability.',
    items: [
      'Marketing Websites & Landing Systems',
      'Web Apps & Customer Portals',
      'SaaS & Internal Platforms',
    ],
    href: '/services/websites-and-platforms',
  },
  {
    category: 'Mobile & Cross-Platform Apps',
    description: 'Performance that feels native everywhere.',
    items: [
      'iOS & Android Apps',
      'React Native Cross-Platform Engineering',
      'Auth, Sync & Secure Cloud Connectivity',
    ],
    href: '/services/mobile',
  },
  {
    category: 'Cloud & Security',
    description: 'Stay fast. Stay online. Stay secure.',
    items: [
      'Vercel / AWS / Azure Architecture',
      'Serverless & Edge Deployments',
      'Monitoring, Observability & Uptime',
      'Identity & Access Controls',
    ],
    href: '/services/cloud-and-security',
  },
  {
    category: 'Data, AI & Automation',
    description: 'Smarter systems, less manual work.',
    items: [
      'API & System Integrations',
      'AI-Powered Workflows & Features',
      'Dashboards, Analytics & Reporting',
    ],
    href: '/services/data-ai-automation',
  },
  {
    category: 'Growth & Marketing',
    description: "Performance isn't just technical - it's visible.",
    items: [
      'SEO & Web Performance Optimization',
      'Conversion Tracking & Attribution',
      'Campaign & Content Activation',
    ],
    href: '/services/growth-and-marketing',
  },
  {
    category: 'Ongoing Support',
    description: "We don't just build - we evolve with you.",
    items: [
      'Maintenance & Upgrades',
      'Performance & Security Reviews',
      'Continuous Feature Development',
    ],
    href: '/services/ongoing-support',
  },
];

type NavigationProps = {
  isHeroVisible?: boolean;
  heroIsDark?: boolean;
};

export default function Navigation({ isHeroVisible = false, heroIsDark = true }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Determine if we should use light text (for dark backgrounds)
  const useLightText = !isScrolled && isHeroVisible && heroIsDark && !isServicesOpen && !isNavHovered;
  const textColor = useLightText ? 'text-white' : 'text-navy-900';
  const logoColor = useLightText ? 'text-white' : 'text-navy-900';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled || isServicesOpen || isNavHovered
          ? 'bg-white shadow-sm'
          : isHeroVisible
          ? 'bg-transparent'
          : 'bg-white shadow-sm'
      )}
      onMouseEnter={() => setIsNavHovered(true)}
      onMouseLeave={() => setIsNavHovered(false)}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-wide">
        <div className="flex items-center h-20">
          {/* Left Side: Hamburger + Logo + Navigation */}
          <div className="flex items-center space-x-8 flex-1">
            {/* Hamburger Menu */}
            <button
              className={cn("p-2 transition-colors duration-500", textColor)}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-signal-red">
              <Image
                src="/logo.png"
                alt="IE Global"
                width={180}
                height={60}
                className="h-14 w-auto transition-opacity duration-500 hover:opacity-80"
                priority
              />
            </Link>

            {/* Navigation Items (Left-aligned) */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/case-studies"
                className={cn("text-sm font-medium transition-all duration-200", textColor)}
              >
                Work
              </Link>

              {/* Services Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <button
                  className={cn("text-sm font-medium flex items-center gap-1 transition-all duration-200", textColor)}
                  aria-expanded={isServicesOpen}
                  aria-haspopup="true"
                >
                  <span>Services</span>
                  <span className="text-xs">▼</span>
                </button>

                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="fixed left-0 right-0 top-20 bg-white shadow-lg border-t border-gray-100 z-40"
                    >
                      <div className="container-wide">
                        <div className="grid grid-cols-12 gap-0">
                          {/* Left: Service List */}
                          <div className="col-span-4 py-8 px-8 border-r border-gray-100 flex gap-6">
                            <div className="text-base font-bold text-signal-red whitespace-nowrap">
                              What We Have<br/>To Offer
                            </div>
                            <div className="flex-1">
                              {servicesMenu.map((service, idx) => (
                                <Link
                                  key={idx}
                                  href={service.href}
                                  className={cn(
                                    "group flex items-center gap-2 py-2 px-3 transition-all duration-200 rounded-sm",
                                    hoveredService === idx ? "bg-off-white" : ""
                                  )}
                                  onMouseEnter={() => setHoveredService(idx)}
                                  onMouseLeave={() => setHoveredService(null)}
                                >
                                  <span className={cn(
                                    "text-xs transition-all duration-200",
                                    hoveredService === idx ? "text-signal-red translate-x-1" : "text-slate-400"
                                  )}>→</span>
                                  <h4 className={cn(
                                    "text-sm font-medium transition-colors duration-200",
                                    hoveredService === idx ? "text-signal-red" : "text-navy-900"
                                  )}>
                                    {service.category}
                                  </h4>
                                </Link>
                              ))}
                              <div className="pt-4 mt-4 border-t border-gray-100">
                                <Link
                                  href="/services"
                                  className="text-xs font-semibold text-signal-red hover:underline uppercase tracking-wide"
                                >
                                  View All Services
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Right: Description Panel */}
                          <div className="col-span-8 py-8 px-10">
                            <AnimatePresence mode="wait">
                              {hoveredService !== null && (
                                <motion.div
                                  key={hoveredService}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <h3 className="text-2xl font-bold text-navy-900 mb-4">
                                    {servicesMenu[hoveredService].category}
                                  </h3>
                                  <p className="text-sm text-slate-700 italic mb-6">
                                    {servicesMenu[hoveredService].description}
                                  </p>
                                  <ul className="space-y-2">
                                    {servicesMenu[hoveredService].items.map((item, i) => (
                                      <li key={i} className="text-sm text-slate-700 flex items-start">
                                        <span className="text-signal-red mr-2">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/about"
                className={cn("text-sm font-medium transition-all duration-200", textColor)}
              >
                Approach
              </Link>

              <Link
                href="/insights"
                className={cn("text-sm font-medium transition-all duration-200", textColor)}
              >
                Insights
              </Link>

              <Link
                href="/about"
                className={cn("text-sm font-medium transition-all duration-200", textColor)}
              >
                About
              </Link>

              <Link
                href="/careers"
                className={cn("text-sm font-medium transition-all duration-200", textColor)}
              >
                Careers
              </Link>
            </div>
          </div>

          {/* Right Side: Start Project + Search */}
          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/contact"
              className="hidden lg:inline-flex items-center px-6 py-2.5 bg-signal-red text-white text-sm font-semibold hover:bg-signal-red/90 transition-all duration-200"
            >
              Start a Project
            </Link>

            <button
              className={cn("hidden lg:block transition-colors duration-500", textColor)}
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Side Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <Image
                    src="/logo.png"
                    alt="IE Global"
                    width={150}
                    height={50}
                    className="h-12 w-auto"
                  />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <Link
                  href="/case-studies"
                  className="block py-3 text-navy-900 hover:text-signal-red font-medium text-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Work
                </Link>

                <div className="space-y-3 border-b border-gray-100 pb-4">
                  <div className="font-semibold text-navy-900 text-lg mb-3">Services</div>
                  {servicesMenu.map((service, idx) => (
                    <Link
                      key={idx}
                      href={service.href}
                      className="block py-2 text-slate-700 hover:text-signal-red transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {service.category}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/about"
                  className="block py-3 text-navy-900 hover:text-signal-red font-medium text-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Approach
                </Link>

                <Link
                  href="/insights"
                  className="block py-3 text-navy-900 hover:text-signal-red font-medium text-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Insights
                </Link>

                <Link
                  href="/about"
                  className="block py-3 text-navy-900 hover:text-signal-red font-medium text-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>

                <Link
                  href="/careers"
                  className="block py-3 text-navy-900 hover:text-signal-red font-medium text-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Careers
                </Link>

                <Link
                  href="/contact"
                  className="btn-primary w-full mt-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start a Project
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

