import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ParsedData } from "./types";
import { validateCSV, ValidationResult } from "@/lib/csvValidation";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

interface UploadStepProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onParsedData: (data: ParsedData | null) => void;
  onNext: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const UploadStep = React.memo(function UploadStep({ file, onFileSelect, onParsedData, onNext }: UploadStepProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidation = useCallback(async (selectedFile: File) => {
    setIsValidating(true);
    setValidation(null);
    onParsedData(null);
    
    const result = await validateCSV(selectedFile);
    setValidation(result);
    setIsValidating(false);

    if (result.isValid && result.parsedData) {
      onFileSelect(selectedFile);
      onParsedData(result.parsedData);
      toast.success("File validated successfully.");
    } else {
      onFileSelect(null);
      toast.error(result.error || "File validation failed.");
    }
  }, [onFileSelect, onParsedData]);

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === "file-invalid-type") {
        toast.error("Invalid file type. Please upload a CSV file.");
      } else if (rejection.errors[0]?.code === "file-too-large") {
        toast.error("File exceeds the 5 MB limit.");
      } else {
        toast.error(rejection.errors[0]?.message || "Failed to upload file.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      await handleValidation(acceptedFiles[0]);
    }
  }, [onFileSelect, onParsedData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxSize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 1,
  });

  const removeFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    onParsedData(null);
    setValidation(null);
  }, [onFileSelect, onParsedData]);

  return (
    <motion.div
      key="upload-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b border-zinc-100">
          <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">
            Import Leads via CSV
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Upload a CSV file to preview and import CRM leads.
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!file && !isValidating && (!validation || validation.isValid) ? (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...getRootProps()}
                className={`group relative rounded-lg border-2 border-dashed p-6 sm:p-10 min-h-[200px] flex flex-col justify-center items-center text-center transition-all cursor-pointer ${
                  isDragActive
                    ? "border-blue-400 bg-blue-50/50"
                    : "border-zinc-200 bg-zinc-50/30 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-200 mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <UploadCloud
                    className={`h-5 w-5 ${isDragActive ? "text-zinc-800" : "text-zinc-600"}`}
                  />
                </div>
                <h3 className="text-sm font-medium text-zinc-900">
                  Drop your CSV here
                </h3>
                <p className="text-sm text-zinc-500 mt-1 mb-4">or click to browse</p>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-400">Supported format: CSV</p>
                  <p className="text-xs text-zinc-400">Maximum file size: 5 MB</p>
                </div>
              </motion.div>
            ) : isValidating ? (
              <motion.div
                key="validating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full relative"
              >
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-sm font-medium text-zinc-700">Validating CSV file...</p>
                </div>
                <div className="opacity-50 pointer-events-none scale-y-75 origin-top hidden sm:block">
                  <SkeletonTable />
                </div>
              </motion.div>
            ) : validation && !validation.isValid ? (
              <motion.div
                key="error-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm relative text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-md font-semibold text-red-900 mb-2">Validation Failed</h3>
                <p className="text-sm text-red-700 mb-6">{validation.error}</p>
                <Button variant="outline" onClick={() => setValidation(null)}>Try Again</Button>
              </motion.div>
            ) : (
              <motion.div
                key="file-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm relative overflow-hidden group"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-zinc-900 truncate" title={file?.name}>
                          {file?.name}
                        </p>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {file && formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-500">
              {!file ? "No file selected" : "Ready to preview"}
            </p>
          </div>

          <div className="mt-6 flex justify-end w-full">
            <Button className="w-full sm:w-auto" disabled={!file || !validation?.isValid} onClick={onNext}>
              Continue
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <motion.div 
          className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm transition-shadow hover:shadow-md"
          whileHover={{ y: -2 }}
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">
            Supported Sources
          </h3>
          <ul className="text-sm text-zinc-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Facebook Lead Export
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Google Ads Export
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Excel
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              CRM Export
            </li>
          </ul>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm transition-shadow hover:shadow-md"
          whileHover={{ y: -2 }}
        >
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">
            Requirements
          </h3>
          <ul className="text-sm text-zinc-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              CSV only
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              UTF-8 Encoding
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              Max 5 MB
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
