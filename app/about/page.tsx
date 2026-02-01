import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/ui/Hero';
import MeetTheFounders from '@/components/ui/MeetTheFounders';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About IE Global',
  description: 'The story behind IE Global. We exist to build digital systems that create momentum—not friction. Meet the founders, our values, and how we work.',
  openGraph: {
    title: 'About IE Global | Building Systems That Last',
    description: 'The story behind IE Global. We exist to build digital systems that create momentum—not friction.',
    url: 'https://ie-global.net/about',
  },
  alternates: { canonical: 'https://ie-global.net/about' },
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  Why We Exist
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="lg:col-span-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  What We Believe
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="lg:col-span-8">
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

      {/* How We Work - Workspace */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/pexels-xexusdesigner-777001.jpg"
                  alt="Modern development workspace with dual monitors and focused setup"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">
                How We Work
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6 leading-tight">
                A focused setup for focused work
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                No corporate cubicles. No distraction. We build in environments designed for deep work—dual monitors, clean desks, and the tools that let us ship fast and reliably.
              </p>
              <p className="text-base text-slate-700 leading-relaxed">
                The people you meet are the people who code, design, and architect. We stay small by choice so we can stay sharp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values - Grid */}
      <section className="section bg-off-white">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  The Team
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="lg:col-span-8">
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
              <div className="pt-8">
                <MeetTheFounders variant="about" embed />
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
