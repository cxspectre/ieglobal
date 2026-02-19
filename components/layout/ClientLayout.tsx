'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import CookieConsent from '@/components/ui/CookieConsent';

type ClientLayoutProps = {
  children: ReactNode;
  locale?: string;
};

export default function ClientLayout({ children, locale }: ClientLayoutProps) {
  const pathname = usePathname();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [heroIsDark, setHeroIsDark] = useState(true);
  const [isDashboardHost, setIsDashboardHost] = useState(false);

  useEffect(() => {
    setIsDashboardHost(window.location?.hostname?.startsWith('dashboard.') ?? false);
  }, []);

  // Pages without nav/footer (portal pages) — pathname may include locale prefix e.g. /en/dashboard
  // Also hide when on dashboard subdomain (URL may show / but content is rewritten to /dashboard)
  const noLayoutPages = ['/login', '/dashboard', '/portal', '/reset-password', '/auth', '/upload', '/showcase'];
  const hideLayout = isDashboardHost || noLayoutPages.some(path => pathname?.includes(path));

  // Pages without dark heroes (always use white navbar with dark text)
  const isTemplateDetail = pathname?.match(/\/templates\/[^/]+/);
  const whiteBackgroundPages = ['/privacy', '/terms', '/imprint'];
  const isWhiteBackgroundPage = whiteBackgroundPages.some(p => pathname?.endsWith(p) || pathname === p) || !!isTemplateDetail;

  useEffect(() => {
    const handleScroll = () => {
      // Hero is typically in the viewport for the first 80vh
      setIsHeroVisible(window.scrollY < window.innerHeight * 0.8);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for custom events from hero carousel
  useEffect(() => {
    const handleHeroChange = (e: CustomEvent) => {
      setHeroIsDark(e.detail.isDark);
    };

    window.addEventListener('hero-slide-change', handleHeroChange as EventListener);
    return () => window.removeEventListener('hero-slide-change', handleHeroChange as EventListener);
  }, []);

  // If it's a portal page, don't render nav/footer
  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation 
        isHeroVisible={!isWhiteBackgroundPage && isHeroVisible} 
        heroIsDark={heroIsDark} 
      />
      <main id="main-content">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}

