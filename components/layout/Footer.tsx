'use client';

import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  company: [
    { title: 'About', href: '/about' },
    { title: 'Approach', href: '/approach' },
    { title: 'Work', href: '/case-studies' },
    { title: 'Services', href: '/services' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact', href: '/contact' },
  ],
  legal: [
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Terms of Service', href: '/terms' },
    { title: 'Imprint', href: '/imprint' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white no-print" role="contentinfo">
      {/* Main Footer Content */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-signal-red">
              <Image
                src="/logo.png"
                alt="IE Global"
                width={150}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Digital engineering that creates momentum—not friction.
            </p>
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
