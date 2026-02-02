import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cloud & Security | IE Global',
  description: 'Fast, secure, and effortless to scale. Cloud systems that keep your business online, protected, and performing under pressure.',
};

export default function CloudAndSecurityPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="Cloud & Security"
        subtitle="Fast, secure, and effortless to scale."
        backgroundPattern="gradient"
      />

      {/* Description */}
      <section className="section bg-white">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              Your infrastructure should be invisible — reliable, automated, and secure.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We architect and implement cloud systems that keep your business online, protected, and performing under pressure.
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
              <span className="text-lg text-slate-700">Cloud setup (AWS, Azure, Vercel)</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">CI/CD pipelines</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Monitoring & alerting</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Zero-downtime deployments</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Access control & permissions</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Security hardening</span>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-signal-red flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg text-slate-700">Backup & disaster recovery</span>
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
              <h4 className="font-bold text-lg mb-2 text-navy-900">Cloud environment</h4>
              <p className="text-slate-700">Production-ready infrastructure</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Security review</h4>
              <p className="text-slate-700">Comprehensive security assessment</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Monitoring dashboards</h4>
              <p className="text-slate-700">Real-time performance and health monitoring</p>
            </div>
            <div className="bg-off-white p-6 border-l-4 border-signal-red">
              <h4 className="font-bold text-lg mb-2 text-navy-900">Documentation & credentials</h4>
              <p className="text-slate-700">Complete setup documentation and access management</p>
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
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Cloud Setup Package</h3>
              <p className="text-slate-600 mb-6">Infrastructure setup</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€350</div>
              <p className="text-slate-700">Complete cloud environment configuration</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Security Audit</h3>
              <p className="text-slate-600 mb-6">Comprehensive review</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€650</div>
              <p className="text-slate-700">Full security assessment and hardening</p>
            </div>
            <div className="bg-white p-8 shadow-lg border-t-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-4 text-navy-900">Scaling Sprint</h3>
              <p className="text-slate-600 mb-6">Optimization</p>
              <div className="text-4xl font-bold text-signal-red mb-6">€300</div>
              <p className="text-slate-700">Performance optimization and scaling improvements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to secure your infrastructure?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's build cloud systems that keep you online and protected.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
}

