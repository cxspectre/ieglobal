import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Approach',
  description: 'How we turn ideas into fast, reliable, long-lasting digital systems. Clarity first, engineering excellence always.',
};

export default function ApproachPage() {
  return (
    <>
      <Hero
        eyebrow="Our Approach"
        title="How We Turn Ideas Into Systems That Last"
        subtitle="Clarity first, engineering excellence always. From strategy to launch—and beyond."
        backgroundPattern="gradient"
      />

      {/* Introduction */}
      <section className="section bg-white">
        <div className="container-narrow text-center">
          <p className="text-2xl text-navy-900 leading-relaxed max-w-3xl mx-auto">
            We don't just build digital products. We engineer systems that are fast, reliable, and ready to grow with your business.
          </p>
        </div>
      </section>

      {/* The 5-Step Process */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-6xl">
          {/* Step 1 */}
          <div className="mb-16 lg:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <div className="text-6xl font-bold font-mono text-signal-red/30 mb-4">01</div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    Understand the Business
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-xl text-navy-900 font-semibold mb-6">
                  Not just the brief
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Before writing a single line of code, we make sure we fully understand what the business is trying to achieve, where processes break today, who the users are, and what success actually looks like.
                </p>
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  This phase is clarity-first, not tech-first. The goal: define the right problem and avoid building the wrong solution fast.
                </p>
                <div className="bg-white p-6 border-l-4 border-signal-red">
                  <p className="text-sm font-bold text-navy-900 mb-3">Deliverables include:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• Project blueprint</li>
                    <li>• User & system mapping</li>
                    <li>• Prioritized roadmap</li>
                    <li>• Success metrics (performance, usability, outcomes)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-16 lg:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <div className="text-6xl font-bold font-mono text-signal-red/30 mb-4">02</div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    Architect the Solution
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-xl text-navy-900 font-semibold mb-6">
                  With long-term thinking
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  Once the challenge is clear, we design a system that performs under real-world pressure, scales as the business grows, stays maintainable, and integrates seamlessly with existing workflows.
                </p>
                <p className="text-base text-slate-700 leading-relaxed mb-6">
                  No quick fixes, no shortcuts, no fragile foundations.
                </p>
                <div className="bg-white p-6 border-l-4 border-signal-red">
                  <p className="text-sm font-bold text-navy-900 mb-3">Deliverables include:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• Technical architecture</li>
                    <li>• Integration plan</li>
                    <li>• Component structure</li>
                    <li>• Long-term scalability considerations</li>
                    <li>• Security & reliability plan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-16 lg:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <div className="text-6xl font-bold font-mono text-signal-red/30 mb-4">03</div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    Build with Precision
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-xl text-navy-900 font-semibold mb-6">
                  Engineering meets craft
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  We build fast, accessible, modern websites and apps with clean interfaces and strong UX foundations. Everything is type-safe, version-controlled, and built with high coding standards.
                </p>
                <div className="bg-white p-6 border-l-4 border-signal-red">
                  <p className="text-sm font-bold text-navy-900 mb-3">Deliverables include:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• Fully functional product</li>
                    <li>• Responsive UI across devices</li>
                    <li>• CMS/content setup if needed</li>
                    <li>• Integrations (APIs, automations, tracking)</li>
                    <li>• Staging & preview environments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-16 lg:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <div className="text-6xl font-bold font-mono text-signal-red/30 mb-4">04</div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    Test Like a Real User
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-xl text-navy-900 font-semibold mb-6">
                  Not just a developer
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  We validate through cross-device testing, performance checks, UX flow verification, error handling, and accessibility. We simulate how customers, clients, or team members actually use the product.
                </p>
                <div className="bg-white p-6 border-l-4 border-signal-red">
                  <p className="text-sm font-bold text-navy-900 mb-3">Deliverables include:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• QA report</li>
                    <li>• Fixes and refinements</li>
                    <li>• Polished final version ready for production</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-3">
                <div className="lg:sticky lg:top-32">
                  <div className="text-6xl font-bold font-mono text-signal-red/30 mb-4">05</div>
                  <h2 className="text-2xl font-bold text-navy-900">
                    Launch & Support
                  </h2>
                </div>
              </div>
              <div className="lg:col-span-9">
                <p className="text-xl text-navy-900 font-semibold mb-6">
                  Beyond day one
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  We handle deployment, hosting, domain setup, monitoring, analytics, and training. After launch, clients can choose ongoing support or run independently.
                </p>
                <div className="bg-white p-6 border-l-4 border-signal-red">
                  <p className="text-sm font-bold text-navy-900 mb-3">Deliverables include:</p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• Production deployment</li>
                    <li>• Walkthrough call</li>
                    <li>• Documentation</li>
                    <li>• Optional long-term maintenance package</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
              The Principles Behind Our Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Build fast. Build stable. Build once.
              </h3>
              <p className="text-slate-700">
                We don't redo work. We build foundations that last.
              </p>
            </div>

            <div className="p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Simple for users, powerful for business
              </h3>
              <p className="text-slate-700">
                Technology shouldn't feel complicated—even when it is.
              </p>
            </div>

            <div className="p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Think long-term from day one
              </h3>
              <p className="text-slate-700">
                Your digital system should still work beautifully three years from now.
              </p>
            </div>

            <div className="p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Connect everything
              </h3>
              <p className="text-slate-700">
                Tools, data, workflows—a unified ecosystem performs better.
              </p>
            </div>

            <div className="p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Quality over shortcuts. Always.
              </h3>
              <p className="text-slate-700">
                Good engineering pays off every day after launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-navy-900 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Let's build something that creates momentum for your business.
          </p>
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
