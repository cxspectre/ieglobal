'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const founders = [
  {
    name: { first: 'Cassian', last: 'Drefke' },
    role: 'Founder',
    image: '/IMG_0342.jpg',
    imagePosition: '50% 35%', // center face in circular crop
  },
  {
    name: { first: 'Wessel', last: 'Gederblom' },
    role: 'Co-Founder',
    image: '/7e204664-ee6f-4b20-853e-476fc98fc899.jpg',
    imagePosition: '50% 35%', // center face in circular crop
  },
];

type MeetTheFoundersProps = {
  variant?: 'home' | 'about';
  /** When true, render only the founder cards (no section wrapper, title, or link). For embedding in About page. */
  embed?: boolean;
};

export default function MeetTheFounders({ variant = 'home', embed = false }: MeetTheFoundersProps) {
  const isAbout = variant === 'about';

  const content = (
    <>
      {!embed && (
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isAbout ? 'text-white' : 'text-navy-900'}`}>
            Meet the Founders
          </h2>
          <p className={`text-lg ${isAbout ? 'text-gray-200' : 'text-slate-700'}`}>
            The people behind IE Global—strategy, design, and engineering in one team.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start max-w-3xl mx-auto">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.name.last}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-slate-200 shadow-xl ${isAbout ? 'ring-4 ring-white/20' : 'ring-4 ring-white'}`}>
                <Image
                  src={founder.image}
                  alt={`${founder.name.first} ${founder.name.last} - ${founder.role}`}
                  fill
                  className="object-cover"
                  style={{ objectPosition: founder.imagePosition }}
                  sizes="192px"
                />
              </div>
              <h3 className={`text-xl font-bold mb-1 ${isAbout ? 'text-white' : 'text-navy-900'}`}>
                <span className="font-bold">{founder.name.first}</span>{' '}
                <span className="font-normal">{founder.name.last}</span>
              </h3>
              <p className="text-sm font-semibold text-signal-red uppercase tracking-wider">
                {founder.role}
              </p>
            </motion.div>
          ))}
      </div>

      {!embed && !isAbout && (
        <div className="text-center mt-12">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-base font-semibold text-signal-red hover:gap-3 transition-all duration-200"
          >
            <span>Learn more about us</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );

  if (embed) {
    return <div className="container-wide max-w-5xl">{content}</div>;
  }

  return (
    <section
      className={
        isAbout
          ? 'section bg-navy-900 text-white'
          : 'section bg-off-white'
      }
    >
      <div className="container-wide max-w-5xl">
        {content}
      </div>
    </section>
  );
}
