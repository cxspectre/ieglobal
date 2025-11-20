import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using IE Global services.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-lg text-slate-700">
            Last updated: November 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-narrow prose prose-lg max-w-none">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using IE Global's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>Services</h2>
          <p>
            IE Global provides digital engineering services including but not limited to:
          </p>
          <ul>
            <li>Website and platform development</li>
            <li>Mobile application development</li>
            <li>Cloud architecture and infrastructure</li>
            <li>System integration and automation</li>
            <li>Ongoing technical support and maintenance</li>
          </ul>

          <h2>Project Engagement</h2>
          <h3>Proposal and Agreement</h3>
          <p>
            All projects begin with a proposal outlining scope, timeline, deliverables, and costs. Work commences only after both parties have signed a formal agreement.
          </p>

          <h3>Client Responsibilities</h3>
          <p>Clients are responsible for:</p>
          <ul>
            <li>Providing timely feedback and approvals</li>
            <li>Supplying necessary content, assets, and access</li>
            <li>Timely payment according to agreed terms</li>
            <li>Maintaining communication throughout the project</li>
          </ul>

          <h2>Intellectual Property</h2>
          <h3>Client-Owned Work</h3>
          <p>
            Upon full payment, clients own the final deliverables created specifically for their project. This includes custom code, designs, and content created by IE Global.
          </p>

          <h3>IE Global Property</h3>
          <p>
            IE Global retains ownership of our methodologies, frameworks, reusable components, and any pre-existing intellectual property used in delivering services.
          </p>

          <h2>Payment Terms</h2>
          <ul>
            <li>Payment schedules are outlined in individual project agreements</li>
            <li>Late payments may incur fees and suspend work</li>
            <li>Refunds are handled on a case-by-case basis as outlined in project agreements</li>
          </ul>

          <h2>Confidentiality</h2>
          <p>
            Both parties agree to keep confidential any proprietary or sensitive information shared during the course of the engagement. This obligation survives the termination of services.
          </p>

          <h2>Warranties and Disclaimers</h2>
          <p>
            IE Global warrants that services will be performed in a professional and workmanlike manner. However, we do not guarantee specific business outcomes or results. Services are provided "as is" without warranties beyond those explicitly stated in project agreements.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, IE Global's liability for any claims arising from our services shall not exceed the amount paid by the client for the specific services giving rise to the claim.
          </p>

          <h2>Termination</h2>
          <p>
            Either party may terminate services with written notice as specified in the project agreement. Clients remain responsible for payment for work completed up to the termination date.
          </p>

          <h2>Modifications</h2>
          <p>
            We may modify these Terms of Service at any time. Material changes will be communicated to active clients. Continued use of our services after changes constitutes acceptance of new terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the Netherlands. Any disputes will be resolved in accordance with Dutch law.
          </p>

          <h2>Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:hello@ie-global.net">hello@ie-global.net</a>
          </p>

          <div className="mt-12 p-6 bg-off-white border-l-4 border-signal-red">
            <h3 className="text-xl font-bold mb-4">Company Details (Imprint)</h3>
            <p className="mb-2"><strong>IE Global</strong></p>
            <p className="mb-2">KvK (Chamber of Commerce): <strong>97185515</strong></p>
            <p className="mb-2">BTW (VAT): <strong>NL737599054B02</strong></p>
            <p className="mb-2">Email: <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline">hello@ie-global.net</a></p>
            <p className="text-sm text-slate-700 mt-4">
              Registered in the Netherlands
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
