import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'IE Global Login | Sign in to Dashboard',
  description:
    'Sign in to the IE Global dashboard. Log in to manage clients, projects, templates, and more. Access your IE Global account.',
  keywords: ['IE Global login', 'IE Global dashboard', 'sign in IE Global', 'IE Global account'],
  openGraph: {
    title: 'IE Global Login | Sign in to Dashboard',
    description: 'Sign in to the IE Global dashboard. Log in to manage clients, projects, and more.',
    url: 'https://ie-global.net/en/login',
    siteName: 'IE Global',
    type: 'website',
  },
  alternates: { canonical: 'https://ie-global.net/en/login' },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}

