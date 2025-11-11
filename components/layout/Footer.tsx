'use client';

import Link from 'next/link';
import Image from 'next/image';
import Newsletter from '@/components/ui/Newsletter';

const footerLinks = {
  services: [
    { title: 'AI & Data Strategy', href: '/services/ai-data-strategy' },
    { title: 'Customer Experience', href: '/services/customer-experience' },
    { title: 'Go-to-Market & Pricing', href: '/services/go-to-market-pricing' },
    { title: 'Operating Model', href: '/services/operating-model' },
    { title: 'Digital Product', href: '/services/digital-product' },
  ],
  company: [
    { title: 'About', href: '/about' },
    { title: 'Case Studies', href: '/case-studies' },
    { title: 'Insights', href: '/insights' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact', href: '/contact' },
  ],
  legal: [
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Cookie Policy', href: '/privacy#cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white no-print" role="contentinfo">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-wide py-16">
          <div className="max-w-2xl">
            <h3 className="text-3xl font-bold mb-4">
              Stay ahead in a rapidly changing world
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Subscribe to our insights—monthly perspectives on AI, customer experience, and growth.
            </p>
            <Newsletter />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-signal-red">
              <Image
                src="/logo.png"
                alt="IE Global"
                width={150}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              IE Global designs, builds, and runs high-performance digital systems—engineered for speed, scalability, reliability, and sustainable growth.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://linkedin.com/company/ieglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/ieglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://github.com/ieglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-bold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} IE Global, Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Built for performance</span>
              <span>•</span>
              <span>Designed for growth</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

