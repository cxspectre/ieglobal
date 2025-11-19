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
      {/* Hero - Dark & Dramatic */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        <div className="container-wide max-w-5xl relative z-10">
          <Link 
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 mb-12"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Work
          </Link>

          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase tracking-wider">
              {caseStudy.industry}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            {caseStudy.title}
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-12 max-w-3xl">
            {caseStudy.summary}
          </p>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
            <div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Client</div>
              <div className="text-base font-semibold text-white">{caseStudy.client}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Industry</div>
              <div className="text-base font-semibold text-white">{caseStudy.industry}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Date</div>
              <div className="text-base font-semibold text-white">{formatDate(caseStudy.date)}</div>
            </div>
            {caseStudy.services && caseStudy.services.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">Services</div>
                <div className="text-base font-semibold text-white">{caseStudy.services.join(', ')}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Outcome Callout - Full Width */}
      {caseStudy.outcome && (
        <section className="py-16 bg-signal-red">
          <div className="container-wide max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                The Outcome
              </p>
              <p className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {caseStudy.outcome}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Key Metrics - Clean Grid */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <section className="py-16 bg-off-white">
          <div className="container-wide max-w-5xl">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-8 text-center">
              Key Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {caseStudy.metrics.map((metric, i) => (
                <div key={i} className="text-center p-6 bg-white border-l-4 border-signal-red">
                  <p className="text-base font-semibold text-navy-900">
                    {metric}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content - Spacious Article Format */}
      <section className="py-20 bg-white">
        <div className="container-wide max-w-4xl">
          <article 
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-navy-900 prose-headings:mb-6
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
              prose-ul:my-6 prose-li:text-slate-700 prose-li:mb-3
              prose-strong:text-navy-900 prose-strong:font-bold
              prose-a:text-signal-red prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: caseStudy.content }}
          />
        </div>
      </section>

      {/* CTA - Confident Close */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Want results like this?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Let's build something that creates momentum for your business.
          </p>
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
