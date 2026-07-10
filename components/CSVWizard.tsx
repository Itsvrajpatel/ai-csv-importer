"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { Stepper } from "./wizard/Stepper";
import { UploadStep } from "./wizard/UploadStep";
import { PreviewStep } from "./wizard/PreviewStep";
import { ProcessingStep } from "./wizard/ProcessingStep";
import { ResultsStep } from "./wizard/ResultsStep";
import { useCSVImport } from "@/hooks/useCSVImport";

export function CSVWizard() {
  const {
    currentStep,
    file,
    setFile,
    parsedData,
    setParsedData,
    importResult,
    setImportResult,
    resetWizard,
    goToNextStep,
    goToPrevStep,
  } = useCSVImport();

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
              onParsedData={setParsedData} 
              onNext={goToNextStep} 
            />
          )}
          {currentStep === 2 && (
            <PreviewStep 
              key="step-2"
              file={file!} 
              parsedData={parsedData} 
              setParsedData={setParsedData} 
              onBack={goToPrevStep} 
              onNext={goToNextStep} 
            />
          )}
          {currentStep === 3 && (
            <ProcessingStep 
              key="step-3"
              file={file!}
              onBack={goToPrevStep}
              onNext={(result) => {
                setImportResult(result);
                goToNextStep();
              }} 
            />
          )}
          {currentStep === 4 && (
            <ResultsStep 
              key="step-4"
              importResult={importResult} 
              onReset={resetWizard} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
