import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import { getPublishedTemplates } from '@/lib/website-templates';
import { TemplatesSection } from '@/components/templates/TemplatesSection';

// Revalidate so new/updated published templates appear (not just build-time snapshot)
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Website Templates – IE Global',
  description: 'Browse our collection of website templates. Modern, responsive designs ready to inspire your next project. Click to explore and open in a new tab.',
  openGraph: {
    title: 'Website Templates – IE Global',
    url: 'https://ie-global.net/templates',
  },
  alternates: { canonical: 'https://ie-global.net/templates' },
};

export default async function TemplatesPage() {
  const templates = await getPublishedTemplates();

  return (
    <>
      <Hero
        eyebrow="Templates"
        title="Website templates to inspire"
        subtitle="Browse our collection of modern, responsive designs. Click any template to read more and open it in a new tab."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-wide">
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
