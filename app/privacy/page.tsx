import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'IE Global privacy policy and data protection information.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container-narrow prose prose-lg max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-slate-700 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2>Introduction</h2>
        <p>
          IE Global ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
        </p>

        <h2>Information We Collect</h2>
        <h3>Information You Provide</h3>
        <ul>
          <li><strong>Contact Information:</strong> Name, email address, company, role</li>
          <li><strong>Communication:</strong> Messages sent through contact forms or email</li>
          <li><strong>Newsletter:</strong> Email address for our mailing list</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li><strong>Analytics:</strong> Page views, time on site, browser type, device information</li>
          <li><strong>Cookies:</strong> Session cookies for functionality, analytics cookies (with consent)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to your inquiries and provide requested information</li>
          <li>Send newsletters and marketing communications (with your consent)</li>
          <li>Improve our website and services</li>
          <li>Analyze usage patterns and trends</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information with:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> Email services, analytics platforms, CRM systems</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        </ul>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt out of marketing communications</li>
          <li>Object to processing of your information</li>
        </ul>

        <h2 id="cookies">Cookies</h2>
        <p>
          We use cookies to enhance your experience. You can control cookies through your browser settings. Essential cookies are required for the website to function properly.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your information. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>International Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries outside your country of residence. We ensure appropriate safeguards are in place.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:privacy@ieglobal.com">privacy@ieglobal.com</a>
        </p>
      </div>
    </div>
  );
}

