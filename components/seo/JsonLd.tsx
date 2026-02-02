/**
 * JSON-LD structured data for SEO.
 * Helps search engines disambiguate IE Global from education institutions
 * and build a proper Knowledge Graph entity.
 */
export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IE Global',
    alternateName: 'IE Global Digital Systems',
    url: 'https://ie-global.net',
    logo: 'https://ie-global.net/logo.png',
    description: 'IE Global is a digital systems and engineering company. We design and operate scalable digital systems, websites, and platforms built for long-term growth.',
    email: 'hello@ie-global.net',
    telephone: '+31-6-21902015',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
    },
    sameAs: [
      'https://www.linkedin.com/company/ie-globalnet/',
      'https://www.instagram.com/ie_global_official',
      // Add Google Business Profile URL when available
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IE Global',
    alternateName: 'IE Global Digital Systems',
    url: 'https://ie-global.net',
    description: 'IE Global – Digital systems, websites, and scalable platforms. Engineering partnerships that move your business forward.',
    publisher: {
      '@type': 'Organization',
      name: 'IE Global',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ie-global.net/logo.png',
      },
    },
    inLanguage: ['en-US', 'de-DE'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
    </>
  );
}
