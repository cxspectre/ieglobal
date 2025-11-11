import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'IE Global terms of service and conditions of use.',
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container-narrow prose prose-lg max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-slate-700 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using the IE Global website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the website.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The content, features, and functionality of this website are owned by IE Global and are protected by international copyright, trademark, and other intellectual property laws.
        </p>

        <h2>Use of Website</h2>
        <p>You may use our website for lawful purposes only. You agree not to:</p>
        <ul>
          <li>Use the website in any way that violates applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to any part of the website</li>
          <li>Interfere with or disrupt the website or servers</li>
          <li>Use any automated system to access the website</li>
        </ul>

        <h2>Professional Services</h2>
        <p>
          Information on this website about our services is for general informational purposes only. Specific terms for professional services engagements will be governed by separate written agreements.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these external sites.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p>
          This website is provided "as is" without warranties of any kind. We do not warrant that the website will be uninterrupted, secure, or error-free.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          IE Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the modified terms.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these Terms of Service, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:legal@ieglobal.com">legal@ieglobal.com</a>
        </p>
      </div>
    </div>
  );
}

