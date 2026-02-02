import type { Metadata } from 'next';
import { useLocale } from 'next-intl';
import Hero from '@/components/ui/Hero';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join IE Global or partner with us. We build meaningful work with talented people.',
};

export default function CareersPage() {
  const locale = useLocale();
  const isDe = locale === 'de';

  return (
    <>
      <Hero
        eyebrow={isDe ? 'Karriere' : 'Careers'}
        title={
          isDe
            ? 'Gestalten Sie sinnvolle Arbeit mit uns'
            : 'Build Meaningful Work With Us'
        }
        subtitle={
          isDe
            ? 'Kleine, erfahrene Teams. Große Probleme. Sichtbare Wirkung.'
            : 'Small senior teams. Big problems. Visible impact.'
        }
        backgroundPattern="gradient"
      />

      {/* Why IE Global */}
      <section className="section bg-white">
        <div className="container-wide max-w-5xl">
          <div className="grid grid-cols-12 gap-16">
            <div className="col-span-4">
              <div className="sticky top-32">
                <h2 className="text-sm font-bold text-signal-red uppercase tracking-wider">
                  {isDe ? 'Warum IE Global?' : 'Why IE Global?'}
                </h2>
                <div className="w-16 h-1 bg-signal-red mt-4"></div>
              </div>
            </div>
            <div className="col-span-8">
              <p className="text-2xl text-navy-900 leading-relaxed mb-8">
                {isDe
                  ? 'Wir bauen eine andere Art von Firma – in der Arbeit direkt in den Ergebnissen unserer Kunden sichtbar wird, Sie durch echte Probleme wachsen und Qualität wichtiger ist als Masse.'
                  : "We're building a different kind of firm—one where your work shows up in client outcomes, where you grow by solving real problems, and where quality matters more than quantity."}
              </p>

              <div className="space-y-8">
                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">
                    {isDe ? 'Senior, kleine Teams' : 'Senior, small teams'}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {isDe
                      ? 'Keine Armee an Juniors. Sie arbeiten direkt mit Kunden – gemeinsam mit erfahrenen Engineers und Designern.'
                      : "No armies of juniors. You'll work directly with clients alongside experienced engineers and designers."}
                  </p>
                </div>

                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">
                    {isDe ? 'Echte Probleme, echte Wirkung' : 'Real problems, real impact'}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {isDe
                      ? 'Strategie, Engineering und Wachstum – Arbeit, die für Entscheider relevant ist und Business-Kennzahlen direkt bewegt.'
                      : 'Strategy, engineering, and growth—work that matters to executives and directly moves business outcomes.'}
                  </p>
                </div>

                <div className="border-l-4 border-signal-red pl-6">
                  <h3 className="text-xl font-bold mb-3 text-navy-900">
                    {isDe ? 'Handwerk & Wachstum' : 'Craft & growth'}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {isDe
                      ? 'Wir investieren in Qualität – durch echte Projekte, kontinuierliches Lernen und enge Zusammenarbeit.'
                      : 'We invest in quality—through real projects, continuous learning, and meaningful collaboration.'}
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
              {isDe ? 'Aktuell keine offenen Stellen' : 'No Open Roles at the Moment'}
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-8">
              {isDe
                ? 'Derzeit konzentrieren wir uns auf laufende Kundenprojekte. Wir sind aber immer offen für den Austausch mit talentierten Engineers, Designer:innen und Product-Thinking-Menschen.'
                : "We're currently focused on delivering exceptional work for our clients. But we're always interested in connecting with talented engineers, designers, and product thinkers."}
            </p>
            <p className="text-lg text-navy-900 font-semibold mb-8">
              {isDe
                ? 'Möchten Sie mit uns zusammenarbeiten oder in Kontakt bleiben?'
                : 'Want to partner with us or stay in touch?'}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
              <span>{isDe ? 'Kontakt aufnehmen' : 'Get in Touch'}</span>
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
              {isDe ? 'Wonach wir suchen' : 'What We Look For'}
            </h2>
            <p className="text-lg text-slate-700">
              {isDe
                ? 'Wenn wir einstellen, achten wir besonders auf diese Eigenschaften.'
                : 'When we do hire, these are the qualities that matter most to us.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                {isDe ? 'Qualität vor Tempo' : 'Craft Over Speed'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {isDe
                  ? 'Ihnen ist wichtig, Dinge richtig zu machen – nicht nur schnell. Details zählen.'
                  : 'You care about doing things right, not just fast. Details matter to you.'}
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                {isDe ? 'Ownership & Eigenverantwortung' : 'Ownership & Autonomy'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {isDe
                  ? 'Sie übernehmen Verantwortung für Ergebnisse, nicht nur für To-dos – und denken strategisch.'
                  : 'You take responsibility for outcomes, not just tasks. You think strategically.'}
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                {isDe ? 'Business-Verständnis' : 'Business Thinking'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {isDe
                  ? 'Sie verstehen, dass Technologie Business-Ziele unterstützt – nicht umgekehrt.'
                  : 'You understand that technology serves business goals, not the other way around.'}
              </p>
            </div>

            <div className="p-8 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">
                {isDe ? 'Kollaborativ im Kern' : 'Collaborative by Nature'}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {isDe
                  ? 'Sie kommunizieren klar, arbeiten gern im Team und schätzen unterschiedliche Perspektiven.'
                  : 'You communicate clearly, work well with others, and value diverse perspectives.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {isDe ? 'Interesse an einer Zusammenarbeit?' : 'Interested in working together?'}
          </h2>
          <p className="text-xl text-gray-200 mb-10">
            {isDe
              ? 'Ob Sie eine Rolle suchen, eine Partnerschaft prüfen oder einfach sprechen möchten – melden Sie sich gern.'
              : "Whether you're looking for a role, a partnership, or just want to connect—reach out."}
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-semibold hover:bg-gray-100 transition-all duration-200 group">
            <span>{isDe ? 'Kontakt aufnehmen' : 'Get in Touch'}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
