import type { Metadata } from 'next';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import Hero from '@/components/ui/Hero';
import MeetTheFounders from '@/components/ui/MeetTheFounders';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'The Team – IE Global Digital Systems & Engineering',
  description: 'IE Global is a digital systems and engineering company. Meet Cassian and Wessel—the founders who build scalable digital systems that create momentum, not friction.',
  openGraph: {
    title: 'The Team – IE Global Digital Systems & Engineering',
    description: 'IE Global is a digital systems and engineering company. Meet the founders who build scalable digital systems that create momentum—not friction.',
    url: 'https://ie-global.net/the-team',
  },
  alternates: { canonical: 'https://ie-global.net/the-team' },
};

export default function TheTeamPage() {
  const locale = useLocale();
  const isDe = locale === 'de';

  return (
    <>
      {/* Hero */}
      <Hero
        eyebrow={isDe ? 'Team' : 'The Team'}
        title={
          isDe ? 'Die Menschen hinter IE Global' : 'The people behind IE Global'
        }
        subtitle={
          isDe
            ? 'Wir sind ein kleines Team, das digitale Systeme baut, die Schwung erzeugen – nicht Reibung. Keine anonyme Agentur. Lernen Sie die beiden Gründer kennen.'
            : "We're a small team that builds digital systems that create momentum—not friction. No faceless agency. Meet the two founders below."
        }
        backgroundPattern="mesh"
      />

      {/* Founders — front and center */}
      <section className="section bg-navy-900 text-white">
        <div className="container-wide max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isDe ? 'Die Gründer' : 'Meet the Founders'}
            </h2>
            <p className="text-lg text-gray-200">
              {isDe
                ? 'Cassian und Wessel führen IE Global. Die Menschen, die Sie kennenlernen, sind dieselben, die auch wirklich bauen – kein Outsourcing, keine Übergaben in der Kette.'
                : 'Cassian and Wessel run IE Global. The people you meet are the people who build—no outsourcing, no handoffs.'}
            </p>
          </div>
          <MeetTheFounders variant="about" embed />
        </div>
      </section>

      {/* Why we exist — single column, punchy */}
      <section className="section bg-white">
        <div className="container-wide max-w-3xl mx-auto text-center">
          <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-6">
            {isDe ? 'Warum es uns gibt' : 'Why We Exist'}
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight mb-6">
            {isDe
              ? 'Digitale Projekte scheitern oft an unklarer Richtung, technischen Abkürzungen und kurzfristigem Denken.'
              : 'Digital projects often fail from unclear direction, technical shortcuts, and short-term thinking.'}
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            {isDe
              ? 'IE Global ist ein Unternehmen für digitale Systeme und Engineering. Wir wurden gegründet, um genau das zu ändern. Wir bauen Systeme, die skalieren, schaffen Klarheit in komplexen Entscheidungen und vereinen Design, Engineering und Strategie in einer Disziplin.'
              : 'IE Global is a digital systems and engineering company. We were created to fix that. We build systems that scale, bring clarity to complex decisions, and combine design, engineering, and strategy into one discipline.'}
          </p>
        </div>
      </section>

      {/* What we believe — split with visual */}
      <section className="section bg-off-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/pexels-xexusdesigner-777001.jpg"
                  alt="Focused development workspace"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider mb-4">
                {isDe ? 'Woran wir glauben' : 'What We Believe'}
              </h2>
              <p className="text-2xl font-bold text-navy-900 mb-6 leading-tight">
                {isDe
                  ? 'Technologie sollte Schwung erzeugen – nicht Reibung.'
                  : 'Technology should create momentum—not friction.'}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-4">
                {isDe
                  ? 'Gute Systeme machen Teams schneller. Klare Interfaces reduzieren Verwirrung. Zuverlässige Plattformen schaffen Raum für Wachstum.'
                  : 'Good systems make teams faster. Clear interfaces reduce confusion. Reliable platforms give businesses room to grow.'}
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                {isDe
                  ? 'Wir bauen mit Intention, arbeiten eng mit Ihnen zusammen und bleiben auch nach dem Launch involviert. Software ist ein lebendiges System – kein einmaliges Projekt.'
                  : 'We build with intention, collaborate closely, and stay involved long after launch. Software is a living system—not a one-off deliverable.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — compact grid */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <h2 className="text-center text-sm font-bold text-signal-red uppercase tracking-wider mb-10">
            {isDe ? 'Unsere Werte' : 'Our Values'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-off-white rounded-lg border border-transparent hover:border-signal-red/30 transition-colors">
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {isDe ? 'Sauber arbeiten' : 'Do It Right'}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {isDe
                  ? 'Wir schneiden keine Ecken ab. Qualität baut sich über Zeit auf.'
                  : "We don&apos;t cut corners. Quality compounds."}
              </p>
            </div>
            <div className="p-6 bg-off-white rounded-lg border border-transparent hover:border-signal-red/30 transition-colors">
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {isDe ? 'Langfristig denken' : 'Think Long-Term'}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {isDe
                  ? 'Wir gestalten für das, was als Nächstes kommt – nicht nur für heute.'
                  : 'We design for what comes next.'}
              </p>
            </div>
            <div className="p-6 bg-off-white rounded-lg border border-transparent hover:border-signal-red/30 transition-colors">
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {isDe ? 'Mit Klarheit handeln' : 'Move With Clarity'}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {isDe
                  ? 'Entscheidungen basieren auf Logik und Daten – nicht auf Lärm.'
                  : 'Decisions grounded in logic, not noise.'}
              </p>
            </div>
            <div className="p-6 bg-off-white rounded-lg border border-transparent hover:border-signal-red/30 transition-colors">
              <h3 className="text-lg font-bold text-navy-900 mb-2">
                {isDe ? 'Neugierig bleiben' : 'Stay Curious'}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                {isDe
                  ? 'Wir experimentieren, testen, lernen und passen uns an.'
                  : 'We experiment, test, learn, and adapt.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-off-white">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-navy-900">
            {isDe
              ? 'Möchten Sie etwas bauen, das bleibt?'
              : 'Want to build something that lasts?'}
          </h2>
          <p className="text-lg text-slate-700 mb-8">
            {isDe
              ? 'Starten Sie ein Gespräch. Sie sprechen direkt mit uns.'
              : "Start a conversation. We&apos;re the ones who&apos;ll answer."}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold rounded-lg hover:bg-signal-red/90 transition-all duration-200 group"
          >
            <span>{isDe ? 'Kontakt aufnehmen' : 'Get in touch'}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
