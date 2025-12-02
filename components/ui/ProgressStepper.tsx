'use client';

import { motion } from 'framer-motion';

type Step = {
  number: number;
  title: string;
  description: string;
};

type ProgressStepperProps = {
  steps: Step[];
  currentStep: number;
};

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto">
        {/* Desktop: Horizontal Stepper */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <motion.div
                className="h-full bg-signal-red"
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            {/* Steps */}
            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const isPending = step.number > currentStep;

              return (
                <div key={step.number} className="flex flex-col items-center relative">
                  {/* Circle */}
                  <motion.div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                      transition-all duration-300 relative z-10
                      ${isCompleted ? 'bg-signal-red text-white shadow-lg' : ''}
                      ${isCurrent ? 'bg-white border-4 border-signal-red text-signal-red shadow-xl' : ''}
                      ${isPending ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                    `}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: step.number * 0.1 }}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </motion.div>

                  {/* Text */}
                  <div className="mt-4 text-center max-w-[140px]">
                    <p className={`
                      text-sm font-semibold mb-1 transition-colors duration-300
                      ${isCompleted || isCurrent ? 'text-navy-900' : 'text-gray-400'}
                    `}>
                      {step.title}
                    </p>
                    <p className={`
                      text-xs transition-colors duration-300
                      ${isCompleted || isCurrent ? 'text-slate-700' : 'text-gray-400'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical Stepper */}
        <div className="lg:hidden space-y-4">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex items-start gap-4">
                {/* Circle */}
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                    transition-all duration-300
                    ${isCompleted ? 'bg-signal-red text-white' : ''}
                    ${isCurrent ? 'bg-white border-4 border-signal-red text-signal-red' : ''}
                    ${isPending ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: step.number * 0.1 }}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </motion.div>

                {/* Text */}
                <div className="flex-1 pt-1">
                  <p className={`
                    text-sm font-semibold mb-1 transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-navy-900' : 'text-gray-400'}
                  `}>
                    {step.title}
                  </p>
                  <p className={`
                    text-xs transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-slate-700' : 'text-gray-400'}
                  `}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

