'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="container-wide text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-bold text-navy-900/10 mb-4">Error</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6">Something went wrong</h2>
          <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 border-2 border-navy-900 font-semibold hover:bg-navy-900 hover:text-white transition-all duration-200"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

