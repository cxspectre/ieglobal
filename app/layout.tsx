import type { Metadata } from 'next';
import { Outfit, Manrope, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import ClientLayout from '@/components/layout/ClientLayout';

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
    default: 'IE Global | Customer-Led Growth & AI Execution',
    template: '%s | IE Global',
  },
  description: 'We help enterprises turn AI and customer insight into measurable growth within 90 days.',
  keywords: ['AI strategy', 'customer experience', 'digital transformation', 'consulting', 'data analytics'],
  authors: [{ name: 'IE Global' }],
  creator: 'IE Global',
  publisher: 'IE Global',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ie-global.net',
    title: 'IE Global | Customer-Led Growth & AI Execution',
    description: 'We help enterprises turn AI and customer insight into measurable growth within 90 days.',
    siteName: 'IE Global',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IE Global | Customer-Led Growth & AI Execution',
    description: 'We help enterprises turn AI and customer insight into measurable growth within 90 days.',
    creator: '@ieglobal',
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

