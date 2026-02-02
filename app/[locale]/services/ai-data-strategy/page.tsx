import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI & Data Strategy for Business Transformation',
  description: 'IE Global turns AI use-cases into business cases. Portfolio prioritization, responsible AI governance, and scalable operating models for AI at scale.',
};

export default function AIDataStrategyPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        eyebrowLink={{ href: '/services', label: 'Digital systems' }}
        title="AI & Data Strategy"
        subtitle="Turn AI use-cases into business cases. From portfolio prioritization to responsible AI governance and scalable operating models."
        backgroundPattern="gradient"
      />

      {/* Problem Statement */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            The challenge
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              Most organizations have a growing list of AI ideas—but struggle to turn enthusiasm into funded programs and measurable outcomes.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              The gap isn't technology. It's translating use-cases into business cases that CFOs approve, designing data foundations that can scale, and building operating models that deliver AI responsibly and sustainably.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We help you move from AI pilots to AI programs—with clear ROI, governance guardrails, and an execution roadmap your organization can deliver.
            </p>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What you get
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Measurable ROI</h3>
              <p className="text-slate-700 leading-relaxed">
                AI portfolio with quantified value at stake, prioritized by feasibility and speed to impact. Board-ready business cases with P&L impact, cost to build, and timeline.
              </p>
            </div>

            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Data readiness</h3>
              <p className="text-slate-700 leading-relaxed">
                Data platform blueprint, quality assessment, and integration roadmap. We identify gaps early and design pragmatic paths to production-ready data.
              </p>
            </div>

            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4">Scalable operating model</h3>
              <p className="text-slate-700 leading-relaxed">
                AI center of excellence or federated model design. Responsible AI policies, governance frameworks, talent plans, and 18-month rollout roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Typical Work */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Typical work
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">AI Portfolio & Business Cases</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Value tree mapping: quantify opportunity across business processes
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Use-case prioritization: balance value, feasibility, speed
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  P&L modeling: revenue lift, cost savings, risk reduction
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  POC design and execution to de-risk investment
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Data Platform Blueprint</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data landscape assessment: sources, quality, lineage
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Architecture design: ingestion, storage, processing, serving
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data quality framework and monitoring
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Integration roadmap and cost modeling
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Responsible AI Policies</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  AI ethics principles and decision framework
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Model risk management and governance playbooks
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bias detection and fairness testing protocols
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Model cards and documentation standards
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-signal-red">Next Best Action Roadmap</h3>
              <ul className="space-y-3 text-slate-700 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Customer journey mapping and decision points
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Action library design (retention, upsell, service)
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Decisioning logic: business rules + predictive models
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Phased rollout plan and success metrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Artifacts */}
      <section className="section bg-off-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            What we deliver
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Value Tree</h4>
              <p className="text-slate-700">Quantified opportunity by business area</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Business Cases</h4>
              <p className="text-slate-700">P&L impact, cost, timeline for each use-case</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Model Cards</h4>
              <p className="text-slate-700">Documentation for each AI model</p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h4 className="font-bold text-lg mb-2">Governance Playbook</h4>
              <p className="text-slate-700">Responsible AI policies and processes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Book an AI portfolio review
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            We'll help you turn your AI ideas into a board-approved investment thesis.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}

