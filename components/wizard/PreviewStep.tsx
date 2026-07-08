import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Papa from "papaparse";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FileText, List, Columns, HardDrive, Loader2 } from "lucide-react";
import { ParsedData } from "./types";
import { StatsCard } from "@/components/ui/StatsCard";

interface PreviewStepProps {
  file: File;
  parsedData: ParsedData | null;
  setParsedData: (data: ParsedData | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PreviewStep({ file, parsedData, setParsedData, onBack, onNext }: PreviewStepProps) {
  const [isParsing, setIsParsing] = useState(!parsedData);

  useEffect(() => {
    if (parsedData || !file) return;

    setIsParsing(true);
    Papa.parse(file, {
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
      },
      error: (error) => {
        setIsParsing(false);
        toast.error("Failed to parse CSV: " + error.message);
      }
    });
  }, [file, parsedData, setParsedData]);

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
    <motion.div
      key="preview-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Data Preview</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Review your parsed data before processing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button disabled={isParsing || !parsedData} onClick={onNext}>
              Confirm Import
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isParsing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-zinc-600 font-medium">Parsing CSV file...</p>
            </div>
          ) : parsedData ? (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatsCard 
                  label="File Name" 
                  value={file.name} 
                  icon={<FileText className="w-4 h-4" />}
                  iconBgColor="bg-blue-50"
                  iconTextColor="text-blue-600"
                />
                <StatsCard 
                  label="Total Rows" 
                  value={parsedData.rows.length} 
                  icon={<List className="w-4 h-4" />}
                  iconBgColor="bg-purple-50"
                  iconTextColor="text-purple-600"
                />
                <StatsCard 
                  label="Total Columns" 
                  value={parsedData.headers.length} 
                  icon={<Columns className="w-4 h-4" />}
                  iconBgColor="bg-orange-50"
                  iconTextColor="text-orange-600"
                />
                <StatsCard 
                  label="File Size" 
                  value={formatFileSize(file.size)} 
                  icon={<HardDrive className="w-4 h-4" />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                />
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
            </>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              Failed to load preview.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
