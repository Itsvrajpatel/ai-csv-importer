"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ImportStepper } from "./wizard/ImportStepper";
import { UploadStep } from "./wizard/UploadStep";
import { useCSVImport } from "@/hooks/useCSVImport";
import { Loader2 } from "lucide-react";

const LoadingFallback = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
    <p className="text-zinc-500 text-sm">Loading step...</p>
  </div>
);

const PreviewStep = dynamic(() => import("./wizard/PreviewStep").then(mod => mod.PreviewStep), {
  loading: () => <LoadingFallback />
});
const ProcessingStep = dynamic(() => import("./wizard/ProcessingStep").then(mod => mod.ProcessingStep), {
  loading: () => <LoadingFallback />
});
const ResultsStep = dynamic(() => import("./wizard/ResultsStep").then(mod => mod.ResultsStep), {
  loading: () => <LoadingFallback />
});

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
    <div className="w-full flex flex-col items-center pt-12 pb-24 px-4 sm:px-6 max-w-full overflow-hidden sm:overflow-visible">
      <ImportStepper currentStep={currentStep} />
      
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
