'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
  name: string;
  email: string;
  company: string;
  role?: string;
  interests: string[];
  message: string;
  consent: boolean;
};

const interestOptions = [
  'AI & Data Strategy',
  'Customer Experience & Growth',
  'Go-to-Market & Pricing',
  'Operating Model & Transformation',
  'Digital Product & Engineering',
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly at hello@ieglobal.com');
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 bg-green-50 border-2 border-green-200 rounded-none text-green-900">
        <h3 className="text-2xl font-bold mb-4">Thanks for reaching out!</h3>
        <p className="text-lg mb-2">We'll respond within 1 business day with a clear next step.</p>
        <p className="text-sm">Keep an eye on your inbox at the email you provided.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-navy-900 mb-2">
          Name <span className="text-signal-red">*</span>
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none"
          {...register('name', { required: 'Name is required' })}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="text-signal-red text-sm mt-1" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2">
          Work Email <span className="text-signal-red">*</span>
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-signal-red text-sm mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Company and Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-navy-900 mb-2">
            Company <span className="text-signal-red">*</span>
          </label>
          <input
            type="text"
            id="company"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none"
            {...register('company', { required: 'Company is required' })}
            aria-invalid={errors.company ? 'true' : 'false'}
          />
          {errors.company && (
            <p className="text-signal-red text-sm mt-1" role="alert">
              {errors.company.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-navy-900 mb-2">
            Role
          </label>
          <input
            type="text"
            id="role"
            className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none"
            {...register('role')}
          />
        </div>
      </div>

      {/* Areas of Interest */}
      <div>
        <fieldset>
          <legend className="block text-sm font-semibold text-navy-900 mb-3">
            Areas of Interest <span className="text-signal-red">*</span>
          </legend>
          <div className="space-y-2">
            {interestOptions.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  className="w-4 h-4 text-signal-red border-gray-300 focus:ring-signal-red rounded-none"
                  {...register('interests', {
                    required: 'Please select at least one area of interest',
                  })}
                />
                <span className="ml-3 text-navy-900">{option}</span>
              </label>
            ))}
          </div>
          {errors.interests && (
            <p className="text-signal-red text-sm mt-2" role="alert">
              {errors.interests.message}
            </p>
          )}
        </fieldset>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-navy-900 mb-2">
          Tell us about your goals <span className="text-signal-red">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-300 focus:border-signal-red focus:outline-none text-navy-900 rounded-none resize-none"
          placeholder="Share your goals, timeline, and any specific challenges you're facing..."
          {...register('message', {
            required: 'Please tell us about your goals',
            minLength: {
              value: 20,
              message: 'Please provide more details (at least 20 characters)',
            },
          })}
          aria-invalid={errors.message ? 'true' : 'false'}
        />
        {errors.message && (
          <p className="text-signal-red text-sm mt-1" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Consent */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="consent"
          className="mt-1 mr-3 w-4 h-4 text-signal-red border-gray-300 focus:ring-signal-red rounded-none"
          {...register('consent', {
            required: 'You must agree to the privacy policy',
          })}
          aria-invalid={errors.consent ? 'true' : 'false'}
        />
        <label htmlFor="consent" className="text-sm text-slate-700">
          I have read the{' '}
          <a href="/privacy" className="text-signal-red hover:underline font-semibold">
            Privacy Policy
          </a>{' '}
          and agree to its terms. <span className="text-signal-red">*</span>
        </label>
      </div>
      {errors.consent && (
        <p className="text-signal-red text-sm" role="alert">
          {errors.consent.message}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-none text-red-900" role="alert">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full md:w-auto px-12"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      <p className="text-sm text-slate-700 italic">
        We'll respond within 1 business day.
      </p>
    </form>
  );
}

