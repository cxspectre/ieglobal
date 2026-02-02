import type { Metadata } from 'next';
import { Outfit, Manrope, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import JsonLd from '@/components/seo/JsonLd';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ie-global.net'),
  title: {
    default: 'IE Global | Digital Agency — Websites, Apps & Systems',
    template: '%s | IE Global',
  },
  description: 'IE Global is a digital agency that builds high-performance websites, platforms, and systems. Strategy, design, and engineering in one team. Based in the Netherlands.',
  keywords: ['digital agency', 'web development', 'website design', 'digital transformation', 'software development', 'IE Global', 'Next.js', 'React', 'Netherlands'],
  authors: [{ name: 'IE Global', url: 'https://ie-global.net' }],
  creator: 'IE Global',
  publisher: 'IE Global',
  alternates: {
    canonical: 'https://ie-global.net',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ie-global.net',
    title: 'IE Global | Digital Agency — Websites, Apps & Systems',
    description: 'IE Global builds high-performance websites, platforms, and systems. Strategy, design, and engineering in one team.',
    siteName: 'IE Global',
    images: [
      {
        url: '/hero-1.png',
        width: 1200,
        height: 630,
        alt: 'IE Global - Digital Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IE Global | Digital Agency — Websites, Apps & Systems',
    description: 'IE Global builds high-performance websites, platforms, and systems. Strategy, design, and engineering in one team.',
    creator: '@ieglobal',
    images: ['/hero-1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${outfit.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#0B1930" />
      </head>
      <body>
        <JsonLd />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

