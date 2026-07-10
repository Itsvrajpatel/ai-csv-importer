import { useState, useCallback } from "react";
import { ParsedData } from "@/components/wizard/types";

export function useCSVImport() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  const resetWizard = useCallback(() => {
    setFile(null);
    setParsedData(null);
    setImportResult(null);
    setCurrentStep(1);
  }, []);

  const goToNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const goToPrevStep = useCallback(() => setCurrentStep((prev) => prev - 1), []);
  const goToStep = useCallback((step: number) => setCurrentStep(step), []);

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
