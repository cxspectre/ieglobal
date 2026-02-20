import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import { getPublishedTemplates } from '@/lib/website-templates';
import { TemplatesSection } from '@/components/templates/TemplatesSection';

// Revalidate so new/updated published templates appear (not just build-time snapshot)
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Website Templates | Free & Responsive Designs – IE Global',
  description:
    'Discover our website templates: free, responsive designs for landing pages, portfolios, and business sites. Browse modern templates and find the right one for your project.',
  keywords: ['website templates', 'free website templates', 'responsive templates', 'landing page templates', 'portfolio templates', 'business website templates'],
  openGraph: {
    title: 'Website Templates | Free & Responsive Designs – IE Global',
    description: 'Discover our website templates: free, responsive designs for landing pages, portfolios, and business sites.',
    url: 'https://ie-global.net/templates',
    siteName: 'IE Global',
    type: 'website',
    images: [{ url: 'https://ie-global.net/pexels-bibekghosh-14553701.jpg', width: 1200, height: 630, alt: 'Website templates' }],
  },
  alternates: { canonical: 'https://ie-global.net/templates' },
  robots: { index: true, follow: true },
};

export default async function TemplatesPage() {
  const templates = await getPublishedTemplates();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Website Templates – IE Global',
    description: 'Free, responsive website templates for landing pages, portfolios, and business websites.',
    url: 'https://ie-global.net/templates',
    numberOfItems: templates.length,
    itemListElement: templates
      .filter((t) => t.slug)
      .map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://ie-global.net/templates/${t.slug}`,
        name: t.name,
        description: t.description ?? undefined,
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Hero
        eyebrow="Templates"
        title="Website templates to inspire"
        subtitle="Browse our collection of modern, responsive designs. Click any template to read more and open it in a new tab."
        backgroundImage="/pexels-bibekghosh-14553701.jpg"
        imageOverlay="bg-black/55"
      />

      <section className="section bg-white" aria-labelledby="templates-heading">
        <div className="container-wide">
          <h2 id="templates-heading" className="sr-only">
            Browse website templates
          </h2>
          <p className="text-slate-600 max-w-2xl mb-10 text-lg">
            Our website templates are free to explore and built for performance: responsive layouts, clean code, and ready for your content. Find landing page templates, portfolio templates, and business website templates across different industries.
          </p>
          {templates.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Templates coming soon</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                We&apos;re curating a selection of website templates. Check back shortly or get in touch to request specific styles.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-colors"
              >
                Get in touch
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          ) : (
            <TemplatesSection templates={templates} />
          )}
        </div>
      </section>

      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Want something custom?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            These templates are starting points. We build tailored websites that match your brand and goals.
          </p>
          <a href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a project
          </a>
        </div>
      </section>
    </>
  );
}
