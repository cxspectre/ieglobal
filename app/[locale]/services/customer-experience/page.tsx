import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Customer Experience & Growth Systems',
  description: 'IE Global turns customer insight into measurable growth. Personalized journeys, Next Best Action, data-driven engagement—higher NPS, increased CLV.',
};

export default function CustomerExperiencePage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        eyebrowLink={{ href: '/services', label: 'Digital systems' }}
        title="Customer Experience & Growth"
        subtitle="Turn customer insight into measurable growth through personalized journeys, Next Best Action, and data-driven engagement."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            The challenge
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              Most organizations know they need to personalize—but struggle to move beyond basic segmentation and batch campaigns.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              The gap isn't technology. It's connecting customer data, designing intelligent journeys, and orchestrating actions across channels in real-time.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We help you build customer experience programs that drive retention, lifetime value, and advocacy—with measurable ROI.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-off-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What you get
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Higher NPS & retention</h3>
              <p className="text-slate-700 leading-relaxed">
                Personalized journeys that anticipate needs, reduce friction, and build loyalty. Proven lift in NPS and customer retention rates.
              </p>
            </div>

            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Increased CLV</h3>
              <p className="text-slate-700 leading-relaxed">
                Next Best Action recommendations that drive upsell, cross-sell, and deeper engagement. Measurable impact on customer lifetime value.
              </p>
            </div>

            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Lower cost-to-serve</h3>
              <p className="text-slate-700 leading-relaxed">
                Proactive engagement reduces inbound contacts and agent handle time. Self-service optimization and intelligent routing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Typical work
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Journey Design & Mapping</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Current-state journey mapping with pain points and opportunities
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Future-state design with personalization moments
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Multi-channel orchestration design
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rapid prototyping and user testing
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Personalization at Scale</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Micro-segmentation (60+ segments vs. 4-8 broad)
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Propensity modeling (churn, upsell, channel preference)
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-time recommendation engines
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  A/B testing frameworks and continuous optimization
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Voice of Customer Analytics</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Survey design and deployment (NPS, CSAT, CES)
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Text analytics on call transcripts and chat logs
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Closed-loop feedback integration
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Actionable insight dashboards for frontline teams
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-off-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            What we deliver
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Journey Maps</h4>
              <p className="text-slate-700">Current & future-state with decision points</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">CX Scorecard</h4>
              <p className="text-slate-700">KPIs, targets, and tracking dashboard</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">NBA Experiment Plan</h4>
              <p className="text-slate-700">Prioritized actions with A/B test designs</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Segmentation Model</h4>
              <p className="text-slate-700">Micro-segments with value propositions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your customer experience?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's build a personalization program that delivers measurable ROI.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a conversation
          </Link>
        </div>
      </section>
    </>
  );
}

