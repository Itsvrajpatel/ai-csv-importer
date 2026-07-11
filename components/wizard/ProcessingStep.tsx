import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { importCSV } from "@/services/importService";
import { ProcessingTimeline } from "./processing/ProcessingTimeline";
import { ProcessingError, categorizeError, ErrorState } from "./processing/ProcessingError";

interface ProcessingStepProps {
  file: File;
  onBack: () => void;
  onNext: (result: any) => void;
}

export const ProcessingStep = React.memo(function ProcessingStep({ file, onBack, onNext }: ProcessingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const isMountedRef = useRef(true);
  const hasStartedRef = useRef(false);

  const startImport = useCallback(async () => {
    setStatus("processing");
    setCurrentStep(0);
    setProgress(0);
    setErrorState(null);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const remaining = 90 - prev;
        return prev < 90 ? prev + remaining * 0.15 + 1 : prev;
      });
    }, 500);

    try {
      const result = await importCSV(file);
      if (!isMountedRef.current) return;
      
      if (result.success === true) {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        
        setCurrentStep(4);
        setProgress(100);
        setStatus("success");
        
        setTimeout(() => {
          if (isMountedRef.current) onNext(result);
        }, 600);
      } else {
        throw new Error(result.message || "Import failed");
      }
      
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      
      setStatus("error");
      setErrorState(categorizeError(err));
    }
  }, [file, onNext]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startImport();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [startImport]);

  return (
    <motion.div
      key="processing-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-0"
    >
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-6 sm:p-10 text-center relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {status === "error" && errorState ? (
            <ProcessingError 
              errorState={errorState} 
              onBack={onBack} 
              onRetry={startImport} 
            />
          ) : (
            <ProcessingTimeline 
              status={status} 
              currentStep={currentStep} 
              progress={progress} 
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
