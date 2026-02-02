import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data, AI & Automation | IE Global',
  description: 'Turn data into decisions. Turn decisions into automation. Automate workflows, integrate systems, and implement AI features.',
};

export default function DataAIAutomationPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Data, AI & Automation"
        subtitle="Turn data into decisions. Turn decisions into automation."
        backgroundPattern="gradient"
      />

      {/* Description */}
      <section className="section bg-white">
        <div className="container-wide max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-slate-700 leading-relaxed mb-6">
                We help companies automate workflows, integrate systems, and implement AI features that unlock efficiency, accuracy, and speed.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Your business becomes smarter — and your team becomes faster.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/pexels-themob000-28428588.jpg"
                alt="Data networks and digital transformation—systems that connect and evolve"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
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
              <span className="text-lg text-slate-700">API integrations</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Workflow automation</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">AI-powered features (chatbots, recommendations, etc.)</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Dashboard development</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Data modeling</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Analytics setup (GA4, custom dashboards)</span>
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
              <h4 className="font-bold text-lg mb-2 text-navy-900">Automated workflows</h4>
              <p className="text-slate-700">Streamlined business processes</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Integration documentation</h4>
              <p className="text-slate-700">Complete technical documentation</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">AI feature implementation (optional)</h4>
              <p className="text-slate-700">AI-powered capabilities integrated into your systems</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Dashboard or analytic tools</h4>
              <p className="text-slate-700">Custom analytics and reporting dashboards</p>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Automation Setup</h3>
              <p className="text-slate-600 mb-6">Basic automation</p>
              <div className="text-4xl font-bold text-signal-red mb-6">from €250</div>
              <p className="text-slate-700">Simple workflow automation</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Full Integration Package</h3>
              <p className="text-slate-600 mb-6">Complete integration</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€650–€1,500</div>
              <p className="text-slate-700">End-to-end system integration</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">AI Feature Development</h3>
              <p className="text-slate-600 mb-6">AI capabilities</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€1,000–€3,500</div>
              <p className="text-slate-700">AI-powered features and workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to automate?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's make your business smarter and your team faster.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}

