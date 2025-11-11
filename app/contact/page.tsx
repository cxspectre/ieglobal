import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import ContactForm from '@/components/ui/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Let us build something great. Tell us about your goals, timeline, and constraints.',
};

export default function ContactPage() {
  return (
    <>
      <Hero
        eyebrow="Contact"
        title="Let's build something great"
        subtitle="Tell us about your goals, timeline, and constraints. We'll respond within 1 business day with a clear next step."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Get in touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-navy-900">Email</div>
                      <a href="mailto:hello@ieglobal.com" className="text-signal-red hover:underline">
                        hello@ieglobal.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-navy-900">Location</div>
                      <div className="text-slate-700">Global delivery with hubs in North America and Europe</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <svg className="w-6 h-6 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-navy-900">Response Time</div>
                      <div className="text-slate-700">Within 1 business day</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6">What to expect</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Quick response:</strong> We'll reply within one business day
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Discovery call:</strong> 30-minute conversation to understand your needs
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Tailored proposal:</strong> Scoped approach with timeline and outcomes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-700">
                      <strong className="text-navy-900">Fast start:</strong> Kick off within 2 weeks if aligned
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-off-white p-8">
                <h4 className="font-bold text-lg mb-3">Prefer email?</h4>
                <p className="text-slate-700 mb-4">
                  Reach out directly at{' '}
                  <a href="mailto:hello@ieglobal.com" className="text-signal-red hover:underline font-semibold">
                    hello@ieglobal.com
                  </a>
                </p>
                <p className="text-sm text-slate-700">
                  We respond to all inquiries, even if we're not the right fit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

