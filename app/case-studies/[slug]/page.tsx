import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCaseStudy, getCaseStudies } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';
import ReadingProgress from '@/components/case-studies/ReadingProgress';
import AnimatedChallenge from '@/components/case-studies/AnimatedChallenge';
import AnimatedOutcome from '@/components/case-studies/AnimatedOutcome';
import AnimatedMetrics from '@/components/case-studies/AnimatedMetrics';
import AnimatedContent from '@/components/case-studies/AnimatedContent';
import AnimatedCTA from '@/components/case-studies/AnimatedCTA';

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

  // Get all case studies to find next one
  const allCaseStudies = getCaseStudies();
  const currentIndex = allCaseStudies.findIndex((cs) => cs.slug === params.slug);
  const nextCaseStudy = allCaseStudies[currentIndex + 1] || allCaseStudies[0];

  return (
    <>
      <ReadingProgress />
      
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
              <AnimatedChallenge challenge={caseStudy.challenge} />
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Callout - Full Width Impact */}
      {caseStudy.outcome && (
        <section className="py-24 bg-signal-red relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-signal-red via-signal-red to-red-600 opacity-90"></div>
          <div className="container-wide max-w-5xl relative z-10 text-center">
            <AnimatedOutcome outcome={caseStudy.outcome} />
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
            <AnimatedMetrics metrics={caseStudy.metrics} />
          </div>
        </section>
      )}

      {/* The Story - Presentation Style */}
      <section className="py-20 bg-white">
        <div className="container-wide max-w-5xl">
          <AnimatedContent content={caseStudy.content} />
        </div>
      </section>

      {/* Next Case Study - Seamless Navigation */}
      {nextCaseStudy && nextCaseStudy.slug !== params.slug && (
        <section className="py-16 bg-off-white border-t border-gray-200">
          <div className="container-wide max-w-5xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Next Case Study
                </p>
                <Link
                  href={`/case-studies/${nextCaseStudy.slug}`}
                  className="group block"
                >
                  <h3 className="text-2xl font-bold text-navy-900 group-hover:text-signal-red transition-colors duration-200 mb-2">
                    {nextCaseStudy.title}
                  </h3>
                  <p className="text-slate-700 group-hover:text-navy-900 transition-colors duration-200">
                    {nextCaseStudy.summary}
                  </p>
                </Link>
              </div>
              <Link
                href={`/case-studies/${nextCaseStudy.slug}`}
                className="inline-flex items-center gap-2 text-signal-red font-semibold hover:gap-3 transition-all duration-200 group"
              >
                <span>Read Next</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA - Strong Close */}
      <section className="py-24 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900"></div>
        <div className="container-wide text-center max-w-3xl mx-auto relative z-10">
          <AnimatedCTA />
        </div>
      </section>
    </>
  );
}
