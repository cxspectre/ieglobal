'use client';

import { Link } from '@/i18n/navigation';
import type { WebsiteTemplate } from '@/lib/website-templates';

type Props = {
  template: WebsiteTemplate;
  allImages: string[];
  longDescriptionHtml: string | null;
  features: string[];
  pageNames: string[];
};

export function TemplateDetailContent({
  template,
  allImages,
  longDescriptionHtml,
  features,
  pageNames,
}: Props) {
  // Hero: thumbnail or first image; gallery = remaining images (exclude hero from gallery)
  const heroImage = template.thumbnail_url || allImages[0];
  const galleryImages = template.thumbnail_url
    ? (Array.isArray(template.gallery_urls) ? template.gallery_urls.slice(0, 4) : [])
    : allImages.slice(1, 5);

  return (
    <div className="min-h-screen bg-white pt-32">
      {/* Back to templates button */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-wide max-w-7xl py-6">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-signal-red rounded-lg hover:bg-signal-red/90 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to templates
          </Link>
        </div>
      </div>

      {/* Hero: text left, thumbnail right */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-wide max-w-7xl py-12 md:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            {/* Text - left */}
            <div className="flex-shrink-0 lg:w-[40%] lg:pr-8">
              <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-signal-red bg-signal-red/10 rounded mb-6">
                {template.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-900 tracking-tight max-w-xl mb-6">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                  {template.description}
                </p>
              )}
            </div>

            {/* Thumbnail - right */}
            {heroImage && (
              <div className="flex-1 lg:w-[60%] min-w-0">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100" style={{ height: 480 }}>
                  <img
                    src={heroImage}
                    alt={`${template.name} preview`}
                    loading="eager"
                    className="w-full h-full object-cover object-top"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main content: two columns */}
      <section className="py-12 md:py-16">
        <div className="container-wide max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left column: description + gallery */}
            <div className="lg:col-span-2 space-y-12">
              {/* Features - prominent, breathing room */}
              {features.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-navy-900 mb-6">Features</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy-900 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Long description */}
              {longDescriptionHtml && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-navy-900 mb-6">About this template</h2>
                  <div
                    className="prose prose-slate max-w-none prose-headings:text-navy-900 prose-headings:text-base prose-h3:text-sm prose-p:text-slate-600 prose-li:text-slate-600 prose-p:leading-relaxed prose-p:mb-4"
                    dangerouslySetInnerHTML={{ __html: longDescriptionHtml }}
                  />
                </div>
              )}

              {/* Gallery - responsive grid for 1–4 images */}
              {galleryImages.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-navy-900 mb-6">Screenshots</h2>
                  <div
                    className={`grid gap-4 ${
                      galleryImages.length === 1
                        ? 'grid-cols-1 max-w-md'
                        : galleryImages.length === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-2 sm:grid-cols-4'
                    }`}
                  >
                    {galleryImages.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3] hover:border-navy-900/30 hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={url}
                          alt={`${template.name} screenshot ${i + 1}`}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: sticky sidebar */}
            <div className="lg:col-span-1">
              <aside className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    Details
                  </h3>
                  <dl className="space-y-4 text-sm">
                    {template.author && (
                      <div>
                        <dt className="text-slate-500 mb-1">Author</dt>
                        <dd className="font-medium text-navy-900">{template.author}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-slate-500 mb-1">Category</dt>
                      <dd className="font-medium text-navy-900">{template.category}</dd>
                    </div>
                  </dl>
                </div>

                {pageNames.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                      Pages
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {pageNames.map((name, i) => (
                        <li key={i} className="text-navy-900">{name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-navy-900 bg-navy-900 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
                    Get started
                  </h3>
                  <p className="text-white/90 text-sm mb-6">
                    Preview this template live or use it as a starting point for your next project.
                  </p>
                  <a
                    href={template.template_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-3 px-4 bg-white text-navy-900 font-semibold rounded-lg hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Preview template
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 bg-navy-900 py-16">
        <div className="container-wide max-w-7xl text-center">
          <p className="text-white/80 mb-6 text-lg">
            Looking for something else? Browse all our templates.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold rounded-lg hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            View all templates
          </Link>
        </div>
      </section>
    </div>
  );
}
