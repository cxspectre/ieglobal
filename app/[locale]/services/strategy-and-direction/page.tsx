import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Strategy & Direction | IE Global',
  description: 'Clarity first. Engineering second. Before we build anything, we help you understand what should be built — and why.',
};

export default function StrategyAndDirectionPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Strategy & Direction"
        subtitle="Clarity first. Engineering second."
        backgroundPattern="gradient"
      />

      {/* Description */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              Before we build anything, we help you understand what should be built — and why.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our Strategy & Direction service aligns your goals, product vision, and technical approach to eliminate guesswork and accelerate execution.
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
              <span className="text-lg text-slate-700">Digital + technical audit</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Product & feature strategy</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Workflow & system mapping</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Architecture recommendation</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Risk & opportunity analysis</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Roadmap planning (30–90 days)</span>
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
              <h4 className="font-bold text-lg mb-2 text-navy-900">Strategic brief (PDF)</h4>
              <p className="text-slate-700">Comprehensive analysis and recommendations</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Technical blueprint</h4>
              <p className="text-slate-700">Architecture and system design documentation</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Prioritized roadmap</h4>
              <p className="text-slate-700">30–90 day execution plan with milestones</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Budget + timeline overview</h4>
              <p className="text-slate-700">Resource planning and cost estimates</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">KPI definition</h4>
              <p className="text-slate-700">Speed, uptime, automation, and success metrics</p>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Strategy Sprint</h3>
              <p className="text-slate-600 mb-6">3–5 days</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€450</div>
              <p className="text-slate-700">Quick strategic assessment and recommendations</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Full Technical Audit</h3>
              <p className="text-slate-600 mb-6">Comprehensive analysis</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€750</div>
              <p className="text-slate-700">Complete technical and workflow assessment</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Roadmap Package</h3>
              <p className="text-slate-600 mb-6">Strategy + Architecture</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€1,200</div>
              <p className="text-slate-700">Complete strategy with roadmap and architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's align your goals, product vision, and technical approach.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}

