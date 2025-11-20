import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join IE Global or partner with us. We build meaningful work with talented people.',
};

export default function CareersPage() {
  return (
    <>
      <Hero
        eyebrow="Careers"
        title="Build Meaningful Work With Us"
        subtitle="Small senior teams. Big problems. Visible impact."
        backgroundPattern="gradient"
      />

      {/* Why IE Global */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-12 gap-16">
            <div className="col-span-4">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  Why IE Global?
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="col-span-8">
              <p className="text-2xl text-navy-900 leading-relaxed mb-8">
                We're building a different kind of firm—one where your work shows up in client outcomes, where you grow by solving real problems, and where quality matters more than quantity.
              </p>

              <div className="space-y-8">
                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">Senior, small teams</h3>
                  <p className="text-slate-700 leading-relaxed">
                    No armies of juniors. You'll work directly with clients alongside experienced engineers and designers.
                  </p>
                </div>

                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">Real problems, real impact</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Strategy, engineering, and growth—work that matters to executives and directly moves business outcomes.
                  </p>
                </div>

                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">Craft & growth</h3>
                  <p className="text-slate-700 leading-relaxed">
                    We invest in quality—through real projects, continuous learning, and meaningful collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Status - No Open Roles */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-4xl text-center">
          <div className="bg-white p-12 shadow-sm border-l-4 border-signal-red">
            <h2 className="text-3xl font-bold mb-6 text-navy-900">
              No Open Roles at the Moment
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-8">
              We're currently focused on delivering exceptional work for our clients. But we're always interested in connecting with talented engineers, designers, and product thinkers.
            </p>
            <p className="text-lg text-navy-900 font-semibold mb-8">
              Want to partner with us or stay in touch?
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
              <span>Get in Touch</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Look For (Future) */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-navy-900">
              What We Look For
            </h2>
            <p className="text-lg text-slate-700">
              When we do hire, these are the qualities that matter most to us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                Craft Over Speed
              </h3>
              <p className="text-slate-700 leading-relaxed">
                You care about doing things right, not just fast. Details matter to you.
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                Ownership & Autonomy
              </h3>
              <p className="text-slate-700 leading-relaxed">
                You take responsibility for outcomes, not just tasks. You think strategically.
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                Business Thinking
              </h3>
              <p className="text-slate-700 leading-relaxed">
                You understand that technology serves business goals, not the other way around.
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                Collaborative by Nature
              </h3>
              <p className="text-slate-700 leading-relaxed">
                You communicate clearly, work well with others, and value diverse perspectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Interested in working together?
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            Whether you're looking for a role, a partnership, or just want to connect—reach out.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-all duration-200 group">
            <span>Get in Touch</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
