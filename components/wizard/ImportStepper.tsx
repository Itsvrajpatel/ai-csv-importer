import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImportStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Preview' },
  { id: 3, name: 'AI Processing' },
  { id: 4, name: 'Results' },
];

export function ImportStepper({ currentStep }: ImportStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-14 w-full max-w-3xl mx-auto px-4">
      <ol role="list" className="flex items-center w-full justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <li key={step.name} className={`relative flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
              <motion.div 
                className="relative flex flex-col items-center justify-center group z-10"
                whileHover={isUpcoming ? { scale: 1.05 } : {}}
              >
                <motion.span 
                  className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300
                    ${isCompleted ? 'border-blue-600 bg-blue-600' : 
                      isCurrent ? 'border-blue-600 ring-4 ring-blue-50' : 
                      'border-zinc-200'}`
                  }
                  layout
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <span className={`text-sm font-semibold ${isCurrent ? 'text-blue-600' : 'text-zinc-400'}`}>
                      {step.id}
                    </span>
                  )}
                </motion.span>
                <span 
                  className={`absolute -bottom-7 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300
                    ${isCurrent ? 'text-blue-600 block' : 
                      isCompleted ? 'text-zinc-900 hidden sm:block' : 'text-zinc-400 hidden sm:block'}`
                  }
                >
                  {step.name}
                </span>
              </motion.div>
              
              {stepIdx !== steps.length - 1 ? (
                <div className="flex-1 mx-2 sm:mx-4 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600 rounded-full" 
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
