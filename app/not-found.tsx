import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white">
      <div className="container-wide text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-bold text-navy-900/10 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 group">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Go Home</span>
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 border-2 border-navy-900 font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200">
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

