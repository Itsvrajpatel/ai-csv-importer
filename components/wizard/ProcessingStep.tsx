import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

interface ProcessingStepProps {
  onNext: () => void;
}

const processingSteps = [
  "Reading CSV format...",
  "Finding Name column...",
  "Extracting Email addresses...",
  "Mapping Company fields...",
  "Preparing CRM Records..."
];

export function ProcessingStep({ onNext }: ProcessingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        setTimeout(onNext, 1200); // Wait a bit before moving to results
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <motion.div
      key="processing-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-10 text-center relative">
        <Loader2 className="w-16 h-16 text-blue-500 mb-6 mx-auto animate-spin" />
        
        <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Analyzing CSV...</h2>
        <p className="text-zinc-500 mb-8">
          AI is mapping your CSV columns into the CRM schema.
        </p>
        
        <div className="text-left space-y-4 max-w-xs mx-auto">
          {processingSteps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isPending = idx > currentStep;
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  isCompleted ? "text-zinc-900" : 
                  isCurrent ? "text-blue-600" : "text-zinc-400"
                }`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
