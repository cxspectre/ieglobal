import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Imprint',
  description: 'Legal information and company details for IE Global.',
};

export default function ImprintPage() {
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
            Imprint
          </h1>
          <p className="text-lg text-slate-700">
            Legal information and company details
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-narrow">
          <div className="max-w-3xl">
            {/* Company Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-navy-900">Company Information</h2>
              <div className="space-y-6 text-lg">
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[140px]">Company Name:</span>
                  <span className="text-slate-700">IE Global</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[140px]">Legal Form:</span>
                  <span className="text-slate-700">Private Company</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[140px]">Registration:</span>
                  <span className="text-slate-700">Registered in the Netherlands</span>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="mb-12 p-8 bg-off-white border-l-4 border-signal-red">
              <h3 className="text-2xl font-bold mb-6 text-navy-900">Registration Details</h3>
              <div className="space-y-4 text-lg">
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[200px]">KvK Number:</span>
                  <span className="text-slate-700 font-mono">97185515</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[200px]">VAT Number:</span>
                  <span className="text-slate-700 font-mono">NL005254766B14</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-navy-900">Contact Information</h2>
              <div className="space-y-4 text-lg">
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[140px]">Email:</span>
                  <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline">
                    hello@ie-global.net
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-semibold text-navy-900 min-w-[140px]">Website:</span>
                  <a href="https://ie-global.net" className="text-signal-red hover:underline">
                    www.ie-global.net
                  </a>
                </div>
              </div>
            </div>

            {/* Responsible for Content */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-navy-900">Responsible for Content</h2>
              <p className="text-lg text-slate-700 mb-4">
                IE Global is responsible for the content published on this website.
              </p>
              <p className="text-base text-slate-700">
                For inquiries regarding website content or services, please contact us at{' '}
                <a href="mailto:hello@ie-global.net" className="text-signal-red hover:underline font-semibold">
                  hello@ie-global.net
                </a>
              </p>
            </div>

            {/* Dispute Resolution */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-navy-900">Dispute Resolution</h2>
              <p className="text-lg text-slate-700 mb-4">
                The European Commission provides a platform for online dispute resolution (ODR):
              </p>
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-red hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </div>

            {/* Disclaimer */}
            <div className="p-6 bg-off-white">
              <h3 className="text-xl font-bold mb-4 text-navy-900">Disclaimer</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Despite careful content control, we assume no liability for the content of external links. The operators of linked pages are solely responsible for their content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

