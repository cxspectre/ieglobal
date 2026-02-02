import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import ContactFormPremium from '@/components/ui/ContactFormPremium';

export const metadata: Metadata = {
  title: 'Contact – Start a Project with IE Global',
  description: 'IE Global designs and operates scalable digital systems, websites, and platforms. Tell us what you are building—we stay involved beyond launch. Based in the Netherlands.',
  openGraph: {
    title: 'Contact – Start a Project with IE Global',
    description: 'Engineering partnerships that move your business forward. IE Global builds scalable digital systems—tell us what you are building.',
    url: 'https://ie-global.net/contact',
  },
  alternates: { canonical: 'https://ie-global.net/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Hero
        eyebrow="Contact"
        title="Let's Work Together"
        subtitle="Engineering partnerships that move your business forward. Tell us what you're building—we'll help you get there."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Left: Content */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-navy-900">
                  Let's build something exceptional.
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  We partner with companies who value performance, reliability, and long-term growth. Whether you're starting something new or improving what exists, we'll help you do it right.
                </p>
                <p className="text-base text-slate-700">
                  → We typically respond within 1 business day.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-navy-900">Why teams work with us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">100% in-house engineering</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Clear estimates and timelines</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Embedded collaboration with your team</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-navy-900">What happens next</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-signal-red text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <p className="text-slate-700 pt-1">
                      We review your goals and current systems.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-signal-red text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <p className="text-slate-700 pt-1">
                      We schedule a short, focused discovery call.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-signal-red text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <p className="text-slate-700 pt-1">
                      You receive a roadmap, scope, and timeline.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic mt-6">
                  No sales pressure. Just clarity and expertise.
                </p>
              </div>

              <div className="bg-off-white p-6 border-l-4 border-signal-red">
                <h4 className="font-bold text-base mb-2 text-navy-900">Prefer email?</h4>
                <p className="text-slate-700 mb-3">
                  Reach out directly at{' '}
                  <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline font-semibold">
                    hello@ie-global.net
                  </a>
                </p>
                <p className="text-sm text-slate-700">
                  We respond to all inquiries, even if we're not the right fit.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-3 text-navy-900">Connect with us</h4>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.linkedin.com/company/ie-globalnet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-900 hover:text-signal-red transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/ie_global_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy-900 hover:text-signal-red transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <ContactFormPremium />
            </div>
          </div>
        </div>
      </section>

      {/* Final Confidence Line */}
      <section className="py-16 bg-white">
        <div className="container-wide text-center">
          <p className="text-xl font-semibold text-navy-900">
            Your systems should create momentum—not friction.
          </p>
        </div>
      </section>
    </>
  );
}

