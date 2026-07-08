import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Preview' },
  { id: 3, name: 'AI Processing' },
  { id: 4, name: 'Results' },
];

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-12 w-full max-w-2xl mx-auto px-4">
      <ol role="list" className="flex items-center w-full justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="relative flex flex-col items-center justify-center group z-10">
              <span 
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors bg-white
                  ${currentStep > step.id ? 'border-blue-600 bg-blue-600' : 
                    currentStep === step.id ? 'border-blue-600' : 
                    'border-zinc-300'}`
                }
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4 text-white" aria-hidden="true" />
                ) : (
                  <span className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-zinc-500'}`}>
                    {step.id}
                  </span>
                )}
              </span>
              <span 
                className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap
                  ${currentStep === step.id ? 'text-blue-600' : 
                    currentStep > step.id ? 'text-zinc-900' : 'text-zinc-500'}`
                }
              >
                {step.name}
              </span>
            </div>
            
            {stepIdx !== steps.length - 1 ? (
              <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-zinc-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
                  style={{ width: currentStep > step.id ? '100%' : '0%' }}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
