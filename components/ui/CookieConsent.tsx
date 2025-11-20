'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'ie-global-cookie-consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'accepted', { expires: 365 });
    setShowBanner(false);
  };

  const declineCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'declined', { expires: 365 });
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container-wide max-w-6xl mx-auto">
            <div className="bg-white shadow-2xl border border-gray-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    We use essential cookies to ensure our website works properly and analytics cookies to understand how you use our site. 
                    You can choose to accept or decline optional cookies. 
                    {' '}
                    <Link href="/privacy" className="text-signal-red hover:underline font-semibold">
                      Learn more
                    </Link>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={declineCookies}
                    className="px-6 py-2.5 text-sm font-semibold text-navy-900 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap"
                  >
                    Decline Optional
                  </button>
                  <button
                    onClick={acceptCookies}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-signal-red hover:bg-signal-red/90 transition-colors duration-200 whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

