'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('footer');

  const companyLinks = [
    { key: 'theTeam', href: '/the-team' },
    { key: 'approach', href: '/approach' },
    { key: 'work', href: '/case-studies' },
    { key: 'services', href: '/services' },
    { key: 'careers', href: '/careers' },
    { key: 'contact', href: '/contact' },
  ];
  const legalLinks = [
    { key: 'privacyPolicy', href: '/privacy' },
    { key: 'termsOfService', href: '/terms' },
    { key: 'imprint', href: '/imprint' },
  ];

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
            <p className="text-gray-300 leading-relaxed mb-6">
              {t('tagline')}
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@ie-global.net"
                className="block text-gray-300 hover:text-signal-red transition-colors duration-200"
              >
                hello@ie-global.net
              </a>
              <a
                href="tel:+31621902015"
                className="block text-gray-300 hover:text-signal-red transition-colors duration-200"
              >
                +31 6 21 90 20 15
              </a>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-6">{t('company')}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-lg mb-6">{t('legal')}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-signal-red transition-colors duration-200"
                  >
                    {t(link.key)}
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
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>{t('builtFor')}</span>
              <span>•</span>
              <span>{t('designedFor')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
