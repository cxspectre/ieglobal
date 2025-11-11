import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join IE Global. Small senior teams, big problems, visible impact.',
};

export default function CareersPage() {
  return (
    <>
      <Hero
        eyebrow="Careers"
        title="Where will your career take you?"
        subtitle="Small senior teams, big problems, visible impact. Join us in building the future of digital transformation."
        backgroundPattern="gradient"
      />

      {/* Pitch */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Why IE Global?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              We're building a different kind of consulting firm—one where strategy meets execution, where your work shows up in client KPIs, and where you grow by solving real problems at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Senior, small teams</h3>
              <p className="text-slate-700 leading-relaxed">
                No armies of juniors. You'll work directly with clients alongside experienced consultants, engineers, and designers.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Big, real problems</h3>
              <p className="text-slate-700 leading-relaxed">
                AI strategy, customer experience transformation, digital product delivery—work that matters to executives and boards.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Visible impact</h3>
              <p className="text-slate-700 leading-relaxed">
                You'll see your work go live, move metrics, and influence decisions. No shelfware.
              </p>
            </div>

            <div className="border-l-4 border-signal-red pl-6">
              <h3 className="text-2xl font-bold mb-3">Craft & growth</h3>
              <p className="text-slate-700 leading-relaxed">
                We invest in your development—through real projects, mentorship, and continuous learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Open roles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-sm card">
              <h3 className="text-2xl font-bold mb-3">Consultant</h3>
              <p className="text-slate-700 mb-4">
                Lead client engagements, design strategies, and deliver measurable outcomes across industries.
              </p>
              <Link href="/contact" className="text-signal-red hover:underline font-semibold">
                Apply →
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm card">
              <h3 className="text-2xl font-bold mb-3">Data Scientist</h3>
              <p className="text-slate-700 mb-4">
                Build predictive models, design AI solutions, and turn data into client value.
              </p>
              <Link href="/contact" className="text-signal-red hover:underline font-semibold">
                Apply →
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm card">
              <h3 className="text-2xl font-bold mb-3">Product/UX Designer</h3>
              <p className="text-slate-700 mb-4">
                Design digital products and customer experiences that drive engagement and conversion.
              </p>
              <Link href="/contact" className="text-signal-red hover:underline font-semibold">
                Apply →
              </Link>
            </div>

            <div className="bg-white p-8 shadow-sm card">
              <h3 className="text-2xl font-bold mb-3">Engagement Manager</h3>
              <p className="text-slate-700 mb-4">
                Run complex programs, orchestrate teams, and ensure delivery excellence.
              </p>
              <Link href="/contact" className="text-signal-red hover:underline font-semibold">
                Apply →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diversity Statement */}
      <section className="section bg-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Diverse teams, better outcomes
          </h2>
          <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            We're committed to building an inclusive team that reflects the diversity of our clients and communities. Different perspectives make us stronger, more creative, and more effective.
          </p>
          <p className="text-lg text-slate-700 mt-6 max-w-2xl mx-auto">
            IE Global is an equal opportunity employer. We welcome applicants from all backgrounds.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-signal-red text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to join us?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Send us your resume and tell us what you're excited to build.
          </p>
          <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-signal-red">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}

