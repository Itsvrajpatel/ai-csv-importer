import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UploadStepProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onNext: () => void;
}

export function UploadStep({ file, onFileSelect, onNext }: UploadStepProps) {
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    // Handle rejections
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
      onFileSelect(acceptedFiles[0]);
      toast.success("File selected successfully.");
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxSize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 1,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
        <div className="p-6 border-b border-zinc-100">
          <h1 className="text-xl font-semibold text-zinc-900">
            Import Leads via CSV
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Upload a CSV file to preview and import CRM leads.
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                {...getRootProps()}
                className={`group relative rounded-lg border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                  isDragActive
                    ? "border-zinc-400 bg-zinc-100"
                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-50"
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
            ) : (
              <motion.div
                key="file-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-zinc-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatFileSize(file.size)}
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

          <div className="mt-6 flex justify-end">
            <Button disabled={!file} onClick={onNext}>Continue</Button>
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">
            Supported Sources
          </h3>
          <ul className="text-sm text-zinc-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              Facebook Lead Export
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              Google Ads Export
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              Excel
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
              CRM Export
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm">
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
        </div>
      </div>
    </motion.div>
  );
}
