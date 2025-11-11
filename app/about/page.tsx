import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About IE Global',
  description: 'We design and build high-performance digital systems that are fast, scalable, and built to last. Technology should accelerate growth—not slow it down.',
};

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About"
        title="We Build Digital Systems That Create Momentum"
        subtitle="Technology should accelerate growth—not slow it down."
        backgroundPattern="mesh"
      />

      {/* Positioning Paragraph */}
      <section className="section bg-white">
        <div className="container-narrow">
          <p className="text-xl text-slate-700 leading-relaxed text-center max-w-4xl mx-auto">
            IE Global is a digital engineering and performance firm. We work with companies who need systems that can scale—not just launch. Our work bridges strategy, design, and engineering to build digital products that are fast, reliable, and ready for growth. We believe in clarity, technical excellence, and long-term partnership.
          </p>
        </div>
      </section>

      {/* Our Principles */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Core Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Principle 1 */}
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">
                Clarity Before Code
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We make decisions with purpose—not assumptions.
              </p>
              <p className="text-sm text-slate-700 italic">
                Right decisions early save months later.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">
                Performance Is a Feature
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                Speed, reliability, and efficiency drive real business outcomes.
              </p>
              <p className="text-sm text-slate-700 italic">
                Faster systems convert better and scale smoother.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">
                Design for Longevity
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                Systems should evolve, not expire.
              </p>
              <p className="text-sm text-slate-700 italic">
                We build with maintainability in mind.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="bg-white p-8 shadow-sm border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">
                Partnership Over Handoffs
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We don't just build and leave. We improve and grow with you.
              </p>
              <p className="text-sm text-slate-700 italic">
                We stay involved after launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How We Work
            </h2>
            <p className="text-lg text-slate-700">
              We combine deep technical expertise with structured collaboration.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-signal-red text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold mb-2 text-navy-900">Understand the business needs</h3>
                <p className="text-slate-700">We start with your goals, not technology.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-signal-red text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold mb-2 text-navy-900">Architect and plan with long-term clarity</h3>
                <p className="text-slate-700">Design systems that scale and integrate cleanly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-signal-red text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold mb-2 text-navy-900">Build fast, refine continuously</h3>
                <p className="text-slate-700">Ship quality code with testing and documentation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-10 h-10 bg-signal-red text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold mb-2 text-navy-900">Support and scale with you</h3>
                <p className="text-slate-700">Ongoing optimization, features, and partnership.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red hover:gap-3 transition-all duration-200">
              <span>Learn More About Our Approach</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Mindset */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Built for a Global World
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-12">
            Our team works across time zones and industries—with engineering workflows designed for clarity, async collaboration, and sustainable delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-300 text-sm">
            <span>North America</span>
            <span>•</span>
            <span>Europe</span>
            <span>•</span>
            <span>Asia Pacific</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-navy-900">
            Ready to build something that lasts?
          </h2>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
            <span>Start a Conversation</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
