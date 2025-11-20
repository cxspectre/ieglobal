'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import CookieConsent from '@/components/ui/CookieConsent';

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [heroIsDark, setHeroIsDark] = useState(true);

  // Pages without dark heroes (always use white navbar)
  const whiteBackgroundPages = ['/privacy', '/terms', '/imprint'];
  const isWhiteBackgroundPage = whiteBackgroundPages.includes(pathname);

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

