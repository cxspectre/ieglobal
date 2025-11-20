import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services',
  description: 'From strategy to launch and beyond. We build digital systems that are fast, scalable, and built to last.',
};

const services = [
  {
    number: '01',
    title: 'Strategy & Direction',
    description: 'Clarity first, code second.',
    details: 'Digital audits, technical assessments, platform roadmapping, and product strategy. We define the right problem before writing a single line of code.',
    href: '/services/strategy-and-direction',
  },
  {
    number: '02',
    title: 'Websites & Platforms',
    description: 'Built with Next.js for speed, security, and sustainability.',
    details: 'Marketing websites, web apps, customer portals, and SaaS platforms. High-performance systems designed to scale with your business.',
    href: '/services/websites-and-platforms',
  },
  {
    number: '03',
    title: 'Mobile & Cross-Platform Apps',
    description: 'Performance that feels native everywhere.',
    details: 'iOS and Android apps with React Native. Secure authentication, offline sync, and cloud connectivity.',
    href: '/services/mobile',
  },
  {
    number: '04',
    title: 'Cloud & Security',
    description: 'Stay fast. Stay online. Stay secure.',
    details: 'Vercel, AWS, and Azure architecture. Serverless deployments, monitoring, observability, and access controls.',
    href: '/services/cloud-and-security',
  },
  {
    number: '05',
    title: 'Data, AI & Automation',
    description: 'Smarter systems, less manual work.',
    details: 'API integrations, AI-powered workflows, intelligent features, dashboards, and real-time analytics.',
    href: '/services/data-ai-automation',
  },
  {
    number: '06',
    title: 'Growth & Marketing',
    description: "Performance isn't just technical - it's visible.",
    details: 'SEO, web performance optimization, conversion tracking, attribution, and campaign activation.',
    href: '/services/growth-and-marketing',
  },
  {
    number: '07',
    title: 'Ongoing Support',
    description: "We don't just build - we evolve with you.",
    details: 'Maintenance, upgrades, performance reviews, security updates, and continuous feature development.',
    href: '/services/ongoing-support',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="From Strategy to Scale"
        subtitle="We build digital systems that are fast, reliable, and ready to grow with your business."
        backgroundPattern="mesh"
      />

      {/* Introduction */}
      <section className="section bg-white">
        <div className="container-wide max-w-4xl text-center">
          <p className="text-2xl text-navy-900 leading-relaxed">
            Seven core services. One unified approach. Engineering that creates momentum.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-6xl">
          <div className="space-y-1">
            {services.map((service, index) => (
              <Link
                key={service.number}
                href={service.href}
                className="group block bg-white p-8 md:p-12 hover:bg-navy-900 transition-all duration-500 border-l-4 border-transparent hover:border-signal-red"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start">
                  {/* Number */}
                  <div className="md:col-span-2">
                    <span className="text-5xl md:text-6xl font-bold font-mono text-signal-red/30 group-hover:text-signal-red transition-colors duration-500">
                      {service.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="md:col-span-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-navy-900 group-hover:text-white transition-colors duration-500">
                      {service.title}
                    </h3>
                    <p className="text-base text-signal-red group-hover:text-signal-red/90 mb-4 italic transition-colors duration-500">
                      {service.description}
                    </p>
                    <p className="text-base md:text-lg text-slate-700 group-hover:text-gray-300 leading-relaxed transition-colors duration-500">
                      {service.details}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not sure which service you need?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Let's talk about your goals and challenges. We'll help you find the right path forward.
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
