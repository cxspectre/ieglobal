import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Growth & Marketing | IE Global',
  description: "Performance isn't just technical — it's visible. Optimize your digital presence so your systems don't just work — they grow.",
};

export default function GrowthAndMarketingPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Growth & Marketing"
        subtitle="Performance isn't just technical — it's visible."
        backgroundPattern="gradient"
      />

      {/* Description */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              We optimize your digital presence so your systems don't just work — they grow.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              From SEO to analytics to conversion funnels, we engineer marketing foundations that amplify your product.
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
              <span className="text-lg text-slate-700">On-page SEO</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Performance optimization</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Conversion tracking</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Analytics setup</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">UX improvements</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">A/B testing</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Content support</span>
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
              <h4 className="font-bold text-lg mb-2 text-navy-900">SEO scorecard</h4>
              <p className="text-slate-700">Comprehensive SEO analysis and recommendations</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Performance report</h4>
              <p className="text-slate-700">Speed and optimization analysis</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Tracking setup (GA4 / Tag Manager)</h4>
              <p className="text-slate-700">Complete analytics and conversion tracking</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Conversion audit</h4>
              <p className="text-slate-700">Funnel analysis and optimization recommendations</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Optimization roadmap</h4>
              <p className="text-slate-700">Prioritized plan for continuous improvement</p>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">SEO + Performance</h3>
              <p className="text-slate-600 mb-6">Package</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€300</div>
              <p className="text-slate-700">SEO optimization and performance improvements</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Conversion & Analytics</h3>
              <p className="text-slate-600 mb-6">Setup</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€350</div>
              <p className="text-slate-700">Complete tracking and conversion optimization</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Growth Sprint</h3>
              <p className="text-slate-600 mb-6">Monthly</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€250–€600</div>
              <p className="text-slate-700">Ongoing growth optimization and support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to grow?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's engineer marketing foundations that amplify your product.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}

