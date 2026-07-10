import { useState } from "react";
import { ParsedData } from "@/components/wizard/types";

export function useCSVImport() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  const resetWizard = () => {
    setFile(null);
    setParsedData(null);
    setImportResult(null);
    setCurrentStep(1);
  };

  const goToNextStep = () => setCurrentStep((prev) => prev + 1);
  const goToPrevStep = () => setCurrentStep((prev) => prev - 1);
  const goToStep = (step: number) => setCurrentStep(step);

  return {
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
    goToStep,
  };
}
