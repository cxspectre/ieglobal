import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getInsight, getInsights } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const insights = getInsights();
  return insights.map((insight) => ({
    slug: insight.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const insight = getInsight(params.slug);

  if (!insight) {
    return {
      title: 'Insight Not Found',
    };
  }

  return {
    title: insight.title,
    description: insight.summary,
  };
}

export default function InsightPage({ params }: Props) {
  const insight = getInsight(params.slug);

  if (!insight) {
    notFound();
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container-narrow">
          <Link 
            href="/insights"
            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-navy-900 mb-8 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Insights
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-1 bg-signal-red/10 text-signal-red text-xs font-semibold uppercase tracking-wide">
              {insight.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-navy-900">
            {insight.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-slate-700 mb-8">
            <span>{insight.author}</span>
            <span>•</span>
            <span>{formatDate(insight.date)}</span>
            {insight.readingTime && (
              <>
                <span>•</span>
                <span>{insight.readingTime} min read</span>
              </>
            )}
          </div>

          <p className="text-xl text-slate-700 leading-relaxed">
            {insight.summary}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 bg-white">
        <div className="container-narrow">
          <article className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: insight.content }} />
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to work together?
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

