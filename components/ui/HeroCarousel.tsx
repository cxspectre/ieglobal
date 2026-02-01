'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

type HeroSlide = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  backgroundPattern?: 'gradient' | 'mesh' | 'dark-gradient' | 'purple-gradient';
  backgroundImage?: string;
  /** Override default image overlay (e.g. 'bg-black/70' for darker overlay when text needs more contrast) */
  imageOverlay?: string;
  isDark: boolean;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  onSlideChange?: (isDark: boolean) => void;
};

export default function HeroCarousel({
  slides,
  autoPlayInterval = 5000,
  onSlideChange,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [resetKey, setResetKey] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setResetKey(prev => prev + 1); // Force timer reset
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, autoPlayInterval, resetKey]); // Reset when resetKey changes

  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(slides[currentSlide].isDark);
    }
    
    // Dispatch custom event for navigation
    const event = new CustomEvent('hero-slide-change', {
      detail: { isDark: slides[currentSlide].isDark },
    });
    window.dispatchEvent(event);
  }, [currentSlide, slides, onSlideChange]);

  const getBackgroundClass = (pattern: string) => {
    switch (pattern) {
      case 'gradient':
        return 'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900';
      case 'mesh':
        return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-navy-900 via-navy-800 to-signal-red/20';
      case 'dark-gradient':
        return 'bg-gradient-to-br from-navy-900 to-navy-800';
      case 'purple-gradient':
        return 'bg-gradient-to-br from-navy-900 via-purple-900/30 to-navy-800';
      default:
        return 'bg-navy-900';
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen text-white bg-navy-900">
      {/* Background layers - smooth crossfade */}
      {slides.map((slide, index) => (
        <motion.div
          key={`bg-${index}`}
          initial={false}
          animate={{ 
            opacity: index === currentSlide ? 1 : 0,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ zIndex: index === currentSlide ? 1 : 0 }}
        >
          {slide.backgroundImage ? (
            <>
              <Image
                src={slide.backgroundImage}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
              <div className={`absolute inset-0 ${slide.imageOverlay ?? 'bg-black/50'}`} />
            </>
          ) : (
            <>
              <div className={`absolute inset-0 ${getBackgroundClass(slide.backgroundPattern || 'gradient')}`} />
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
        </motion.div>
      ))}

      {/* Content layer */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <div className="container-wide relative h-full min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl py-24 sm:py-32">
            {/* Eyebrow */}
            <motion.div
              key={`eyebrow-${currentSlide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm font-medium text-white/90 mb-4 block">
                {slides[currentSlide].eyebrow}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {slides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            {slides[currentSlide].subtitle && (
              <motion.p
                key={`subtitle-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            )}

            {/* CTA */}
            <motion.div
              key={`cta-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link 
                href={slides[currentSlide].primaryCTA.href}
                className="inline-flex items-center gap-3 text-sm font-semibold text-white hover:gap-4 transition-all duration-200"
              >
                <span>{slides[currentSlide].primaryCTA.text}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tab Navigation at Bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{ zIndex: 20 }}>
        <div className="container-wide">
          <div className="flex items-center justify-between border-t border-white/20">
            {/* Desktop: Tab Names */}
            <div className="hidden md:flex items-center overflow-x-auto">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative px-0 py-6 text-sm font-medium transition-all duration-300 mr-8 lg:mr-12 whitespace-nowrap ${
                    index === currentSlide ? 'text-white' : 'text-white/60 hover:text-white/80'
                  }`}
                  aria-label={`Go to slide: ${slide.eyebrow}`}
                >
                  {slide.eyebrow}
                  {index === currentSlide && (
                    <motion.div
                      key={`indicator-${currentSlide}-${resetKey}`}
                      className="absolute bottom-0 left-0 h-0.5 bg-signal-red origin-left"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ 
                        duration: autoPlayInterval / 1000, 
                        ease: 'linear' 
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile: Dots */}
            <div className="flex md:hidden items-center gap-2 py-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-signal-red w-8' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
                
            {/* Scroll Indicator - Desktop Only */}
            <motion.div
              className="hidden md:flex py-6 items-center gap-2 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1,
                duration: 0.6,
              }}
            >
              <span className="text-xs uppercase tracking-wider">Scroll</span>
              <motion.div
                className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center"
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
