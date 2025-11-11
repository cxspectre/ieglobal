import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import ContactFormPremium from '@/components/ui/ContactFormPremium';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Engineering partnerships that move your business forward. Tell us what you are building.',
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

