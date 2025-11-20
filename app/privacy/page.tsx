import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How IE Global handles your data and protects your privacy.',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-200">
        <div className="container-narrow">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-signal-red mb-8 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-navy-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-700">
            Last updated: November 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-narrow prose prose-lg max-w-none">
          <h2>Your Privacy Matters</h2>
          <p>
            IE Global ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website or use our services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Contact Forms:</strong> Name, email address, company name, and project details when you submit an inquiry</li>
            <li><strong>Communications:</strong> Any information you provide when you contact us via email or other channels</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li><strong>Analytics:</strong> We use Vercel Analytics to understand how visitors use our site (page views, performance metrics)</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and referral sources</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Deliver the services you request</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Sharing and Disclosure</h2>
          <p>
            We do not sell, rent, or trade your personal information. We may share your information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party tools that help us operate our business (email delivery, hosting, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to or restrict certain types of processing</li>
            <li>Data portability</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies necessary for the website to function properly. Analytics cookies help us understand site usage. You can control cookies through your browser settings.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:hello@ie-global.net">hello@ie-global.net</a>
          </p>

          <div className="mt-12 p-6 bg-off-white border-l-4 border-signal-red">
            <h3 className="text-xl font-bold mb-4">Company Details</h3>
            <p className="mb-2"><strong>IE Global</strong></p>
            <p className="mb-2">KvK (Chamber of Commerce): <strong>97185515</strong></p>
            <p className="mb-2">BTW (VAT): <strong>NL737599054B02</strong></p>
            <p>Email: <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline">hello@ie-global.net</a></p>
          </div>
        </div>
      </section>
    </>
  );
}
