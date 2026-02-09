'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type TemplateRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TemplateRequestModal({ isOpen, onClose }: TemplateRequestModalProps) {
  const t = useTranslations('home');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/request-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, businessName, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setStatus('success');
      setName('');
      setBusinessName('');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || t('templateRequestError'));
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStatus('idle');
      setErrorMessage('');
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-request-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 id="template-request-title" className="text-xl font-bold text-navy-900">
            {t('templateRequestTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-navy-900 mb-2">{t('templateRequestSuccess')}</p>
              <p className="text-slate-600 text-sm">{t('templateRequestSuccessDesc')}</p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 bg-signal-red text-white font-semibold rounded-xl hover:bg-signal-red/90 transition-colors"
              >
                {t('templateRequestClose')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-600 text-sm mb-6">{t('templateRequestSubtitle')}</p>

              <div>
                <label htmlFor="template-name" className="block text-sm font-semibold text-navy-900 mb-1.5">
                  {t('templateRequestName')}
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
                  placeholder="Jane Smith"
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="template-business" className="block text-sm font-semibold text-navy-900 mb-1.5">
                  {t('templateRequestBusiness')}
                </label>
                <input
                  id="template-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
                  placeholder="Acme Inc."
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <label htmlFor="template-email" className="block text-sm font-semibold text-navy-900 mb-1.5">
                  {t('templateRequestEmail')}
                </label>
                <input
                  id="template-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-signal-red focus:ring-2 focus:ring-signal-red/20 outline-none transition-colors"
                  placeholder="jane@acme.com"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('templateRequestCancel')}
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 px-4 py-3 rounded-xl bg-signal-red text-white font-semibold hover:bg-signal-red/90 disabled:opacity-70 transition-colors"
                >
                  {status === 'loading' ? t('templateRequestSending') : t('templateRequestSubmit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
