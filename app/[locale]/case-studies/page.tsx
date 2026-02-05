import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import CaseStudyCard from '@/components/ui/CaseStudyCard';
import { getAllCaseStudies } from '@/lib/case-studies';

export const metadata: Metadata = {
  title: 'Case Studies – IE Global Digital Systems',
  description: 'IE Global case studies: evidence of outcomes across sectors. See how we help ambitious clients achieve measurable results with scalable digital systems.',
  openGraph: {
    title: 'Case Studies – IE Global Digital Systems',
    url: 'https://ie-global.net/case-studies',
  },
  alternates: { canonical: 'https://ie-global.net/case-studies' },
};

export default async function CaseStudiesPage() {
  const caseStudies = await getAllCaseStudies();

  return (
    <>
      <Hero
        eyebrow="Case Studies"
        title="Results that speak for themselves"
        subtitle="Evidence of outcomes across sectors. See how we've helped ambitious clients achieve extraordinary results."
        backgroundPattern="gradient"
      />

      <section className="section bg-white">
        <div className="container-wide">
          {caseStudies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-slate-700">
                Case studies coming soon. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy, index) => (
                <CaseStudyCard
                  key={caseStudy.slug}
                  title={caseStudy.title}
                  summary={caseStudy.summary}
                  client={caseStudy.client}
                  industry={caseStudy.industry}
                  outcome={caseStudy.outcome}
                  href={`/case-studies/${caseStudy.slug}`}
                  metrics={caseStudy.metrics}
                  coverImage={caseStudy.coverImage ?? undefined}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to create your success story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss how we can help you achieve measurable results.
          </p>
          <a href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Start a conversation
          </a>
        </div>
      </section>
    </>
  );
}

