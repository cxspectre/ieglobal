import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import ServiceCard from '@/components/ui/ServiceCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services',
  description: 'We combine strategy, design, and delivery to turn AI and customer insight into measurable growth.',
};

const services = [
  {
    title: 'AI & Data Strategy',
    description: 'Measurable use-case ROI, data guardrails, and operating model. From portfolio prioritization to responsible AI policies and Next Best Action roadmaps.',
    href: '/services/ai-data-strategy',
  },
  {
    title: 'Customer Experience & Growth',
    description: 'Higher NPS, increased CLV, lower cost-to-serve. Journey design, personalization at scale, VoC analytics, and CX scorecards.',
    href: '/services/customer-experience',
  },
  {
    title: 'Go-to-Market & Pricing',
    description: 'Margin lift, win-rate gains, healthier mix. Needs-based segmentation, packaging, pricing tests, and revenue operations.',
    href: '/services/go-to-market-pricing',
  },
  {
    title: 'Operating Model & Transformation',
    description: 'Faster decision cycles, clearer accountability. Organization redesign, planning cadences, portfolio governance, and transformation toolkits.',
    href: '/services/operating-model',
  },
  {
    title: 'Digital Product & Engineering',
    description: 'MVPs that matter, not shelfware. Product discovery, UX, data dashboards, workflow automation, and runbooks.',
    href: '/services/digital-product',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="What we do"
        subtitle="We bring an integrated stack—diagnostics → design → delivery—so every initiative has a line of sight to value."
        backgroundPattern="gradient"
      />

      {/* Services Grid */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.href}
                title={service.title}
                description={service.description}
                href={service.href}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our approach
            </h2>
            <p className="text-xl text-slate-700">
              From discovery to delivery, we follow a disciplined process that balances speed with rigor.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-signal-red text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Discover & Define</h3>
                <p className="text-slate-700 leading-relaxed">
                  Business goals → technical KPIs (TTFB, p95, availability targets, error budgets). We quantify the opportunity and define success metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-signal-red text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Architect</h3>
                <p className="text-slate-700 leading-relaxed">
                  Choose patterns that scale: edge/ISR, queues, caching, multi-region strategy. We design for performance, resilience, and cost-efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-signal-red text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Build</h3>
                <p className="text-slate-700 leading-relaxed">
                  Type-safe implementations, rigorous testing, CI/CD, feature flags. We ship production-ready code with documentation and runbooks.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-signal-red text-white flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Harden</h3>
                <p className="text-slate-700 leading-relaxed">
                  Security reviews, load & chaos tests, observability (tracing, logs, metrics). We stress-test systems before they meet customers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-signal-red text-white flex items-center justify-center text-xl font-bold">
                5
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Run & Improve</h3>
                <p className="text-slate-700 leading-relaxed">
                  SRE playbooks, dashboards, quarterly optimization sprints. We partner for the long term, continuously improving performance and reliability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to talk?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            We work with ambitious leaders who want to define the future, not hide from it. Together, we achieve extraordinary outcomes.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a conversation
          </Link>
        </div>
      </section>
    </>
  );
}

