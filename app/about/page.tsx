import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About IE Global',
  description: 'The story behind IE Global. We exist to build digital systems that create momentum—not friction.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero - Simple, No Background */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container-narrow text-center">
          <span className="inline-block px-4 py-2 text-sm font-semibold bg-signal-red/10 text-signal-red mb-6 tracking-wide uppercase">
            About
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-navy-900">
            Building Systems That Last
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
            Most businesses don't struggle because they lack ideas—they struggle because their systems can't keep up.
          </p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="section bg-off-white">
        <div className="container-narrow">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              Digital projects often collapse not from bad intentions, but from unclear direction, technical shortcuts, and short-term thinking.
            </p>
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              <strong className="text-navy-900">IE Global was created to solve that problem.</strong>
            </p>
            <p className="text-xl text-slate-700 leading-relaxed">
              To build digital systems that actually scale. To bring clarity to complex decisions. To combine design, engineering, and strategy into one continuous discipline.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="section bg-white">
        <div className="container-narrow">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-navy-900">
            What We Believe About Technology
          </h2>
          <div className="space-y-8 max-w-3xl mx-auto">
            <p className="text-lg text-slate-700 leading-relaxed">
              <strong className="text-navy-900 text-xl">We believe technology should create momentum—not friction.</strong>
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Good systems make teams faster. Clear interfaces reduce confusion. Reliable platforms give businesses room to grow.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our work is grounded in clarity, performance, and longevity. We build with intention, collaborate closely, and stay involved long after launch. Because software is not a deliverable—it is a living system.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-off-white">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-navy-900">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-3 text-navy-900">Do It Right</h3>
              <p className="text-slate-700 leading-relaxed">
                We don't cut corners. Quality compounds.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-3 text-navy-900">Think Long-Term</h3>
              <p className="text-slate-700 leading-relaxed">
                We design for what comes next, not just what exists now.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-3 text-navy-900">Move With Clarity</h3>
              <p className="text-slate-700 leading-relaxed">
                Decisions grounded in logic, not noise.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-3 text-navy-900">Stay Curious</h3>
              <p className="text-slate-700 leading-relaxed">
                We experiment, test, learn, and adapt continuously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="section bg-white">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-navy-900">
            The People Behind IE Global
          </h2>
          <p className="text-xl text-slate-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            We are a focused team of engineers, designers, and product thinkers who care about doing meaningful work—work that lasts.
          </p>
          <div className="bg-off-white p-8 max-w-2xl mx-auto border-l-4 border-signal-red">
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              <strong className="text-navy-900">No outsourcing. No handoffs to unknown juniors.</strong>
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              The people you meet are the people who build.
            </p>
          </div>
          <div className="mt-12">
            <p className="text-base text-slate-700 mb-2">Led by:</p>
            <p className="text-2xl font-bold text-navy-900">Cassian & Wessel</p>
            <p className="text-sm text-slate-700 italic mt-4">
              We believe in building systems we are proud to put our names behind.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm bg-navy-900 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Want to build something that lasts?
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
