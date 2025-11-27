import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services',
  description: 'From strategy to scale. We build digital systems that are fast, reliable, and built to last.',
};

const serviceCategories = [
  {
    category: 'Strategy & Planning',
    services: [
      {
        title: 'Strategy & Direction',
        description: 'Technical assessments, product roadmaps, and strategic planning before any code is written.',
        href: '/services/strategy-and-direction',
      },
    ],
  },
  {
    category: 'Build & Deploy',
    services: [
      {
        title: 'Websites & Platforms',
        description: 'High-performance websites and web applications built with Next.js.',
        href: '/services/websites-and-platforms',
      },
      {
        title: 'Mobile Apps',
        description: 'Cross-platform iOS and Android apps with React Native.',
        href: '/services/mobile',
      },
      {
        title: 'Cloud & Security',
        description: 'Scalable cloud architecture and security infrastructure.',
        href: '/services/cloud-and-security',
      },
    ],
  },
  {
    category: 'Scale & Optimize',
    services: [
      {
        title: 'Data, AI & Automation',
        description: 'Integrations, AI workflows, and intelligent automation.',
        href: '/services/data-ai-automation',
      },
      {
        title: 'Growth & Marketing',
        description: 'SEO, performance optimization, and conversion tracking.',
        href: '/services/growth-and-marketing',
      },
      {
        title: 'Ongoing Support',
        description: 'Long-term maintenance and continuous improvement.',
        href: '/services/ongoing-support',
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Hero
        eyebrow="Services"
        title="What We Build"
        subtitle="From strategy to scale. Seven capabilities that work together."
        backgroundPattern="gradient"
      />

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6 leading-tight">
                Seven Services. One Integrated Approach.
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                We don't just build features—we engineer complete systems. From strategic planning to ongoing support, every service is designed to work together.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Whether you need a single service or end-to-end support, we bring clarity, technical excellence, and long-term thinking to every engagement.
              </p>
            </div>
            <div className="bg-off-white p-10 border-l-4 border-signal-red">
              <p className="text-lg text-navy-900 font-semibold mb-4">
                Our Philosophy
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                Technology should accelerate growth—not slow it down. We build systems that are fast, maintainable, and ready to evolve with your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services by Category */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-6xl">
          {serviceCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-20 last:mb-0">
              <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-8">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.href}
                    className="group block bg-white p-8 hover:bg-navy-900 transition-all duration-300 shadow-sm hover:shadow-lg"
                  >
                    <h3 className="text-2xl font-bold mb-4 text-navy-900 group-hover:text-white transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-base text-slate-700 group-hover:text-gray-300 leading-relaxed mb-6 transition-colors duration-300">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-signal-red group-hover:text-white group-hover:gap-3 transition-all duration-200">
                      <span>Learn more</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
            Need help choosing?
          </h2>
          <p className="text-lg text-slate-700 mb-8">
            Let's discuss your goals and find the right approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
              <span>Start a Conversation</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a 
              href="/api/service-overview-pdf" 
              download
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-navy-900 text-navy-900 font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200 group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Service Overview PDF</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
