import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mobile & Cross-Platform Apps | IE Global',
  description: 'One codebase. Every device. Zero compromises. Mobile apps that perform like native experiences.',
};

export default function MobileAppsPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Mobile & Cross-Platform Apps"
        subtitle="One codebase. Every device. Zero compromises."
        backgroundPattern="gradient"
      />

      {/* Description */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              We design and build mobile apps that perform like native experiences — powered by modern cross-platform engineering.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              From iOS to Android to tablet workflows, we deliver applications that feel premium and run seamlessly everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section bg-off-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">App design (UI/UX)</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Cross-platform development (React Native)</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Secure authentication</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">API integration</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Push notifications</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Performance + stability testing</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">App Store / Play Store deployment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Deliverables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Production-ready mobile app</h4>
              <p className="text-slate-700">iOS and Android app ready for deployment</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Admin tools (optional)</h4>
              <p className="text-slate-700">Backend dashboard for content and user management</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">API documentation</h4>
              <p className="text-slate-700">Complete technical documentation</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">App launch setup</h4>
              <p className="text-slate-700">Store listings and deployment configuration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-off-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">MVP Mobile App</h3>
              <p className="text-slate-600 mb-6">Core features</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€3,000–€6,500</div>
              <p className="text-slate-700">Minimum viable product with essential features</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Full Product App</h3>
              <p className="text-slate-600 mb-6">Complete solution</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€7,500–€15,000</div>
              <p className="text-slate-700">Full-featured app with all capabilities</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Enterprise App</h3>
              <p className="text-slate-600 mb-6">Custom scope</p>
              <div className="text-4xl font-bold text-signal-red mb-6">Custom</div>
              <p className="text-slate-700">Enterprise-level apps with custom requirements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to go mobile?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's build an app that performs like native on every device.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a Project
          </Link>
        </div>
      </section>
    </>
  );
}

