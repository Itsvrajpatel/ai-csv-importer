"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  Loader2,
  List,
  Columns,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

type ParsedData = {
  headers: string[];
  rows: Record<string, any>[];
};

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setParsedData(null);
      setIsParsing(true);
      
      // Parse CSV
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsParsing(false);
          if (results.errors.length > 0) {
            toast.error("Error parsing CSV: " + results.errors[0].message);
            return;
          }
          
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, any>[];
          
          setParsedData({ headers, rows });
          toast.success("File parsed successfully.");
          
          // Scroll to preview
          setTimeout(() => {
            previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        },
        error: (error) => {
          setIsParsing(false);
          toast.error("Failed to parse CSV: " + error.message);
        }
      });
    }
  }, []);

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
    setFile(null);
    setParsedData(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const columns = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.headers.map((header) => ({
      accessorKey: header,
      header: header,
      cell: (info: any) => info.getValue() || "",
    }));
  }, [parsedData]);

  const table = useReactTable({
    data: parsedData?.rows || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                    {isParsing ? (
                      <Loader2 className="h-4 w-4 text-zinc-400 animate-spin shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
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
          {!file ? "No file selected" : isParsing ? "Parsing CSV..." : "Ready to import"}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button disabled={!parsedData || isParsing}>Continue</Button>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {parsedData && file && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-10 pt-6 border-t border-zinc-100 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Data Preview</h3>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500">File Name</p>
                  <p className="text-sm font-medium text-zinc-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                  <List className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Rows</p>
                  <p className="text-sm font-medium text-zinc-900">{parsedData.rows.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
                  <Columns className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Columns</p>
                  <p className="text-sm font-medium text-zinc-900">{parsedData.headers.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-md">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">File Size</p>
                  <p className="text-sm font-medium text-zinc-900">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>
            
            {/* Scrollable Table Container */}
            <div className="rounded-lg border border-zinc-200 shadow-sm bg-white overflow-hidden">
              <div className="max-h-[500px] overflow-auto relative">
                <table className="w-full text-sm text-left text-zinc-600">
                  <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 sticky top-0 z-10 shadow-sm">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap bg-zinc-50 border-b border-r border-zinc-200 last:border-r-0">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, index) => (
                      <tr 
                        key={row.id} 
                        className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-2.5 truncate max-w-[250px] border-r border-zinc-100 last:border-r-0" title={String(cell.getValue())}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-sm text-zinc-500 mt-4 text-center">
              Showing all {parsedData.rows.length} rows
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
