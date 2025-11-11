'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
  name: string;
  email: string;
  company?: string;
  message: string;
  timeline: string;
  ongoingSupport: boolean;
};

const timelineOptions = [
  'As soon as possible',
  'Within 1-2 months',
  'Within 3-6 months',
  'Just exploring options',
];

export default function ContactFormPremium() {
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
      setError('Something went wrong. Please try again or email us directly at hello@ie-global.net');
      console.error('Contact form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-10 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-navy-900">Message sent!</h3>
          <p className="text-lg text-slate-700 mb-2">We'll review your information and respond within 1 business day.</p>
          <p className="text-sm text-slate-700">Keep an eye on your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-navy-900 mb-2">
            Your Name <span className="text-signal-red">*</span>
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 transition-colors duration-200"
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
            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 transition-colors duration-200"
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

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-navy-900 mb-2">
            Company
          </label>
          <input
            type="text"
            id="company"
            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 transition-colors duration-200"
            {...register('company')}
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-navy-900 mb-2">
            What are you looking to build or improve? <span className="text-signal-red">*</span>
          </label>
          <textarea
            id="message"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 resize-none transition-colors duration-200"
            placeholder="Tell us about your goals, current challenges, and what success looks like..."
            {...register('message', {
              required: 'Please tell us about your project',
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

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-navy-900 mb-2">
            Timeline & Budget Range
          </label>
          <select
            id="timeline"
            className="w-full px-4 py-3 border border-gray-300 focus:border-signal-red focus:ring-1 focus:ring-signal-red focus:outline-none text-navy-900 transition-colors duration-200"
            {...register('timeline')}
          >
            <option value="">Select a timeline...</option>
            {timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Ongoing Support Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="ongoingSupport"
            className="mt-1 mr-3 w-4 h-4 text-signal-red border-gray-300 focus:ring-signal-red rounded"
            {...register('ongoingSupport')}
          />
          <label htmlFor="ongoingSupport" className="text-sm text-slate-700">
            I'd like ongoing support after launch
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-4 bg-signal-red text-white font-semibold hover:bg-signal-red/90 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubmitting ? 'Sending...' : 'Start a Conversation'}</span>
          {!isSubmitting && (
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

