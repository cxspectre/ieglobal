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
      {/* Hero - Dark & Dramatic Like Other Pages */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-black/30" />
        
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

          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-signal-red text-white text-xs font-bold uppercase tracking-wider">
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

      {/* The Challenge - Bold Statement */}
      <section className="py-20 bg-white">
        <div className="container-wide max-w-6xl">
          <div className="grid grid-cols-12 gap-16 items-start">
            <div className="col-span-3">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">
                  The Challenge
                </h2>
                <div className="w-16 h-1 bg-signal-red"></div>
              </div>
            </div>
            <div className="col-span-9">
              <p className="text-3xl text-navy-900 font-bold leading-tight">
                {caseStudy.challenge}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Callout - Full Width Impact */}
      {caseStudy.outcome && (
        <section className="py-24 bg-signal-red relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-signal-red via-signal-red to-red-600 opacity-90"></div>
          <div className="container-wide max-w-5xl relative z-10 text-center">
            <p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-6">
              The Outcome
            </p>
            <p className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {caseStudy.outcome}
            </p>
          </div>
        </section>
      )}

      {/* Key Metrics - Visual Cards */}
      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <section className="py-20 bg-off-white">
          <div className="container-wide max-w-6xl">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-12 text-center">
              Key Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudy.metrics.map((metric, i) => (
                <div key={i} className="bg-white p-8 text-center border-l-4 border-signal-red shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="text-4xl font-bold text-signal-red mb-3">✓</div>
                  <p className="text-base font-semibold text-navy-900 leading-snug">
                    {metric}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Story - Presentation Style */}
      <section className="py-20 bg-white">
        <div className="container-wide max-w-5xl">
          <article 
            className="case-study-content
              [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-signal-red [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:mb-8 [&>h2]:mt-20 first:[&>h2]:mt-0
              [&>h3]:text-3xl [&>h3]:font-bold [&>h3]:text-navy-900 [&>h3]:mb-6 [&>h3]:mt-12
              [&>h4]:text-xl [&>h4]:font-bold [&>h4]:text-navy-900 [&>h4]:mb-4 [&>h4]:mt-8
              [&>p]:text-lg [&>p]:text-slate-700 [&>p]:leading-relaxed [&>p]:mb-6
              [&>ul]:my-6 [&>ul]:space-y-4 [&>ul]:ml-0
              [&>li]:text-slate-700 [&>li]:text-base [&>li]:leading-relaxed [&>li]:pl-8 [&>li]:relative
              [&>li]:before:content-['•'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-signal-red [&>li]:before:font-bold [&>li]:before:text-xl
              [&>strong]:text-navy-900 [&>strong]:font-bold
              [&>a]:text-signal-red [&>a]:font-semibold [&>a]:no-underline hover:[&>a]:underline
              [&>hr]:my-16 [&>hr]:border-gray-200"
            dangerouslySetInnerHTML={{ __html: caseStudy.content }}
          />
        </div>
      </section>

      {/* CTA - Strong Close */}
      <section className="py-24 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
        <div className="container-wide text-center max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Want results like this?
          </h2>
          <p className="text-xl text-gray-200 mb-12 leading-relaxed">
            Let's build something that creates momentum for your business.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group text-lg">
            <span>Start a Conversation</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
