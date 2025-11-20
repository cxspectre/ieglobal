import type { Metadata } from 'next';
import Hero from '@/components/ui/Hero';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About IE Global',
  description: 'The story behind IE Global. We exist to build digital systems that create momentum—not friction.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero - Dark & Dramatic Like Other Pages */}
      <Hero
        eyebrow="About"
        title="Building Systems That Last"
        subtitle="Most businesses don't struggle because they lack ideas—they struggle because their systems can't keep up."
        backgroundPattern="mesh"
      />

      {/* Why We Exist */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-12 gap-16">
            <div className="col-span-4">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  Why We Exist
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="col-span-8">
              <p className="text-2xl text-navy-900 leading-relaxed mb-8">
                Digital projects often collapse not from bad intentions, but from unclear direction, technical shortcuts, and short-term thinking.
              </p>
              <p className="text-xl text-navy-900 font-bold mb-6">
                IE Global was created to solve that problem.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                To build digital systems that actually scale. To bring clarity to complex decisions. To combine design, engineering, and strategy into one continuous discipline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-12 gap-16">
            <div className="col-span-4">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  What We Believe
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="col-span-8">
              <p className="text-2xl text-navy-900 font-bold leading-tight mb-8">
                Technology should create momentum—not friction.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                Good systems make teams faster. Clear interfaces reduce confusion. Reliable platforms give businesses room to grow.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Our work is grounded in clarity, performance, and longevity. We build with intention, collaborate closely, and stay involved long after launch. Because software is not a deliverable—it is a living system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values - Grid */}
      <section className="section bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="p-8 bg-off-white hover:bg-white border-l-4 border-transparent hover:border-signal-red transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Do It Right
              </h3>
              <p className="text-slate-700 leading-relaxed">
                We don't cut corners. Quality compounds.
              </p>
            </div>

            <div className="p-8 bg-off-white hover:bg-white border-l-4 border-transparent hover:border-signal-red transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Think Long-Term
              </h3>
              <p className="text-slate-700 leading-relaxed">
                We design for what comes next, not just what exists now.
              </p>
            </div>

            <div className="p-8 bg-off-white hover:bg-white border-l-4 border-transparent hover:border-signal-red transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Move With Clarity
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Decisions grounded in logic, not noise.
              </p>
            </div>

            <div className="p-8 bg-off-white hover:bg-white border-l-4 border-transparent hover:border-signal-red transition-all duration-300">
              <h3 className="text-xl font-bold mb-3 text-navy-900">
                Stay Curious
              </h3>
              <p className="text-slate-700 leading-relaxed">
                We experiment, test, learn, and adapt continuously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-12 gap-16">
            <div className="col-span-4">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  The Team
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="col-span-8">
              <p className="text-2xl text-white leading-relaxed mb-8">
                We are a focused team of engineers, designers, and product thinkers who care about doing meaningful work—work that lasts.
              </p>
              <div className="bg-white/5 backdrop-blur-sm p-8 border-l-4 border-signal-red mb-8">
                <p className="text-lg text-gray-200 leading-relaxed mb-4">
                  <strong className="text-white">No outsourcing. No handoffs to unknown juniors.</strong>
                </p>
                <p className="text-lg text-gray-200 leading-relaxed">
                  The people you meet are the people who build.
                </p>
              </div>
              <div className="text-center py-12">
                <p className="text-base text-gray-300 mb-4">Led by:</p>
                <p className="text-4xl font-bold text-white mb-6">Cassian & Wessel</p>
                <p className="text-base text-gray-300 italic">
                  We believe in building systems we are proud to put our names behind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-navy-900">
            Want to build something that lasts?
          </h2>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
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
