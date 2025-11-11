import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';
import { getInsights } from '@/lib/mdx';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Ideas to help you ship faster. Expert perspectives on AI, customer experience, pricing, and digital transformation.',
};

export default function InsightsPage() {
  const insights = getInsights();

  return (
    <>
      <Hero
        eyebrow="Insights"
        title="Ideas to help you ship faster"
        subtitle="Expert perspectives on AI, customer experience, pricing, and digital transformation."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-wide">
          {insights.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-slate-700">
                Insights coming soon. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {insights.map((insight) => (
                <article key={insight.slug} className="card group">
                  <Link href={`/insights/${insight.slug}`} className="block p-8">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-signal-red/10 text-signal-red uppercase tracking-wide">
                        {insight.category}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-navy-900 mb-4 group-hover:text-signal-red transition-colors duration-200">
                      {insight.title}
                    </h3>

                    <p className="text-slate-700 mb-6 leading-relaxed">
                      {insight.summary}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span>{insight.author}</span>
                      <span>{formatDate(insight.date)}</span>
                    </div>

                    {insight.readingTime && (
                      <div className="mt-4 text-sm text-slate-700">
                        {insight.readingTime} min read
                      </div>
                    )}

                    <div className="mt-6 flex items-center text-signal-red font-semibold group-hover:translate-x-2 transition-transform duration-200">
                      <span>Read article</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

