/**
 * JSON-LD structured data for SEO.
 * Helps search engines understand the business and website.
 */
export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IE Global',
    url: 'https://ie-global.net',
    logo: 'https://ie-global.net/logo.png',
    description: 'IE Global is a digital agency that builds high-performance websites, platforms, and systems. Strategy, design, and engineering in one team.',
    email: 'hello@ie-global.net',
    telephone: '+31-6-21902015',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
    },
    sameAs: [],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IE Global',
    url: 'https://ie-global.net',
    description: 'IE Global - Digital agency building high-performance websites, platforms, and systems.',
    publisher: {
      '@type': 'Organization',
      name: 'IE Global',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ie-global.net/logo.png',
      },
    },
    inLanguage: 'en-US',
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
