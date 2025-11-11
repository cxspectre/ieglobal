import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About IE Global',
  description: 'IE Global is a boutique partner built by operators and consultants. We pair rigorous strategy with sleeves-up delivery so value shows up in your KPIs, not just your slides.',
};

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About Us"
        title="We champion the bold to achieve the extraordinary."
        subtitle="IE Global is a boutique partner built by operators and consultants. We pair rigorous strategy with sleeves-up delivery."
        backgroundPattern="gradient"
      />

      {/* Positioning */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Strategy that ships
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              IE Global is a boutique partner built by operators and consultants. We pair rigorous strategy with sleeves-up delivery so value shows up in your KPIs, not just your slides.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Too many transformation programs produce beautiful PowerPoints and underwhelming results. We're different. Our teams combine Bain-style strategy rigor with hands-on execution—building the dashboards, training the teams, and proving the value in 90-day sprints.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Whether you're launching an AI program, redesigning customer experience, or optimizing your go-to-market strategy, we deliver outcomes you can measure.
            </p>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How we work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-signal-red/10 flex items-center justify-center rounded-full">
                <svg className="w-10 h-10 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Co-create</h3>
              <p className="text-slate-700 leading-relaxed">
                Embedded with your teams. We don't hand off and disappear—we roll up our sleeves and build alongside you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-signal-red/10 flex items-center justify-center rounded-full">
                <svg className="w-10 h-10 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Prove value fast</h3>
              <p className="text-slate-700 leading-relaxed">
                Test-and-learn sprints. We favor rapid pilots that prove value in weeks over multi-year transformations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-signal-red/10 flex items-center justify-center rounded-full">
                <svg className="w-10 h-10 text-signal-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Build capability</h3>
              <p className="text-slate-700 leading-relaxed">
                Toolkits, training, and handover. We leave you self-sufficient with the skills and assets to sustain momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Our values
          </h2>

          <div className="space-y-8">
            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Client impact</h3>
              <p className="text-slate-700 leading-relaxed">
                We measure success by your results, not our deliverables. If value doesn't show up in your P&L, we haven't succeeded.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Integrity</h3>
              <p className="text-slate-700 leading-relaxed">
                We tell you what you need to hear, not what you want to hear. If a project isn't working, we'll say so—and pivot.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Craft</h3>
              <p className="text-slate-700 leading-relaxed">
                We care about quality—in our analysis, our code, our design, and our communication. Details matter.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Inclusivity</h3>
              <p className="text-slate-700 leading-relaxed">
                Diverse teams produce better outcomes. We actively build inclusive teams and help clients do the same.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-navy-900 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Work with ambitious leaders who want to define the future
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Together, we achieve extraordinary outcomes.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-navy-900">
            Let's talk
          </Link>
        </div>
      </section>
    </>
  );
}

