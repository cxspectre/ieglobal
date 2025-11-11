'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type NewsletterFormData = {
  email: string;
  consent: boolean;
};

export default function Newsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>();

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Replace with actual newsletter API endpoint
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setIsSuccess(true);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-none text-green-800">
        <p className="font-semibold">Thanks for subscribing!</p>
        <p className="text-sm mt-1">Check your email to confirm your subscription.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            id="newsletter-email"
            placeholder="Your email address"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-signal-red text-sm mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary whitespace-nowrap"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          id="newsletter-consent"
          className="mt-1 mr-2 w-4 h-4 text-signal-red border-gray-300 focus:ring-signal-red rounded-none"
          {...register('consent', {
            required: 'You must agree to the privacy policy',
          })}
          aria-invalid={errors.consent ? 'true' : 'false'}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
        />
        <label htmlFor="newsletter-consent" className="text-sm text-gray-300">
          I have read the{' '}
          <a href="/privacy" className="text-signal-red hover:underline">
            Privacy Policy
          </a>{' '}
          and agree to its terms.
        </label>
      </div>
      {errors.consent && (
        <p id="consent-error" className="text-signal-red text-sm" role="alert">
          {errors.consent.message}
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-none text-red-800" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}

