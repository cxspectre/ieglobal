import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTemplateBySlug, getPublishedTemplates } from '@/lib/website-templates';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const templates = await getPublishedTemplates();
  return templates
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return { title: 'Template Not Found' };
  }

  return {
    title: `${template.name} – Website Template`,
    description: template.description ?? `Explore the ${template.name} website template.`,
    openGraph: {
      title: `${template.name} – IE Global Templates`,
      description: template.description ?? undefined,
    },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('/grid-pattern.svg')" }} />
        <div className="absolute inset-0 bg-black/30" />

        <div className="container-wide max-w-4xl relative z-10">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Templates
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-signal-red text-white text-xs font-bold uppercase tracking-wider">
              {template.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{template.name}</h1>

          {template.description && (
            <p className="text-xl text-gray-200 leading-relaxed">{template.description}</p>
          )}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-wide max-w-4xl">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-lg">
            {template.thumbnail_url ? (
              <div className="aspect-video w-full">
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <svg
                  className="w-24 h-24 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                  />
                </svg>
              </div>
            )}

            <div className="p-8 md:p-10">
              <a
                href={template.template_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-4 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-colors group"
              >
                Open template in new tab
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <p className="mt-6 text-slate-600 text-sm">
                Opens in a new tab at {template.template_url.replace(/^https?:\/\//, '')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm bg-slate-50 border-t border-slate-200">
        <div className="container-wide text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Want something custom?</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            These templates are starting points. We build tailored websites that match your brand and goals.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-colors"
          >
            Start a project
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
