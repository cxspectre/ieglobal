import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCaseStudy, getCaseStudies } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const caseStudies = getCaseStudies();
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const caseStudy = getCaseStudy(params.slug);

  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: caseStudy.title,
    description: caseStudy.summary,
  };
}

export default function CaseStudyPage({ params }: Props) {
  const caseStudy = getCaseStudy(params.slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy-900 text-white">
        <div className="container-narrow">
          <Link 
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-8 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Case Studies
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-1 bg-signal-red text-white text-xs font-semibold uppercase tracking-wide">
              {caseStudy.industry}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {caseStudy.title}
          </h1>

          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            {caseStudy.summary}
          </p>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-400">Client:</span>
              <span className="ml-2 text-white font-semibold">{caseStudy.client}</span>
            </div>
            <div>
              <span className="text-gray-400">Date:</span>
              <span className="ml-2 text-white font-semibold">{formatDate(caseStudy.date)}</span>
            </div>
            {caseStudy.services && caseStudy.services.length > 0 && (
              <div>
                <span className="text-gray-400">Services:</span>
                <span className="ml-2 text-white font-semibold">{caseStudy.services.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Outcome Highlight */}
      {caseStudy.outcome && (
        <section className="py-12 bg-signal-red text-white">
          <div className="container-narrow text-center">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3">
              Outcome
            </p>
            <p className="text-2xl md:text-3xl font-bold">
              {caseStudy.outcome}
            </p>
          </div>
        </section>
      )}

      {/* Metrics */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <section className="py-12 bg-off-white border-b border-gray-200">
          <div className="container-narrow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {caseStudy.metrics.map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="text-sm font-semibold text-signal-red mb-2">✓</div>
                  <div className="text-base text-navy-900 font-semibold">
                    {metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="section bg-white">
        <div className="container-narrow">
          <article className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: caseStudy.content }} />
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-navy-900 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to create your success story?
          </h2>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-all duration-200 group">
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

