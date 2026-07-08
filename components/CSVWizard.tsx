"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Stepper } from "./wizard/Stepper";
import { UploadStep } from "./wizard/UploadStep";
import { PreviewStep } from "./wizard/PreviewStep";
import { ProcessingStep } from "./wizard/ProcessingStep";
import { ResultsStep } from "./wizard/ResultsStep";
import { ParsedData } from "./wizard/types";

export function CSVWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const resetWizard = () => {
    setFile(null);
    setParsedData(null);
    setCurrentStep(1);
  };

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-16">
      <Stepper currentStep={currentStep} />
      
      <div className="w-full mt-4">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <UploadStep 
              key="step-1"
              file={file} 
              onFileSelect={setFile} 
              onNext={() => setCurrentStep(2)} 
            />
          )}
          {currentStep === 2 && (
            <PreviewStep 
              key="step-2"
              file={file!} 
              parsedData={parsedData} 
              setParsedData={setParsedData} 
              onBack={() => setCurrentStep(1)} 
              onNext={() => setCurrentStep(3)} 
            />
          )}
          {currentStep === 3 && (
            <ProcessingStep 
              key="step-3"
              onNext={() => setCurrentStep(4)} 
            />
          )}
          {currentStep === 4 && (
            <ResultsStep 
              key="step-4"
              parsedData={parsedData} 
              onReset={resetWizard} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
