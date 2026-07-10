import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FileText, List, Columns, HardDrive, FileX } from "lucide-react";
import { ParsedData } from "./types";
import { StatsCard } from "@/components/ui/StatsCard";

interface PreviewStepProps {
  file: File;
  parsedData: ParsedData | null;
  setParsedData: (data: ParsedData | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PreviewStep({ file, parsedData, onBack, onNext }: PreviewStepProps) {
  const handleConfirm = () => {
    onNext();
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

  const isEmpty = parsedData && parsedData.rows.length === 0;

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
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Data Preview</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Review your parsed data before processing.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
              Back
            </Button>
            <Button 
              disabled={!parsedData || isEmpty} 
              onClick={handleConfirm}
              className="flex-1 sm:flex-none"
            >
              Confirm Import
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!parsedData ? (
            <div className="text-center py-12 text-zinc-500">
              Failed to load preview. No parsed data available.
            </div>
          ) : isEmpty ? (
             <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileX className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">No valid records found</h3>
                <p className="text-zinc-500 max-w-md mx-auto mb-8">
                  The uploaded CSV file has valid headers but doesn't contain any data rows. 
                  Please check your file and try again.
                </p>
                <Button onClick={onBack} size="lg">
                  Upload Another CSV
                </Button>
             </div>
          ) : (
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
              <div 
                className="rounded-lg border border-zinc-200 shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-shadow"
                tabIndex={0}
                role="region"
                aria-label="CSV Data Preview Table"
              >
                <div className="max-h-[500px] overflow-auto relative custom-scrollbar">
                  <table className="w-full text-sm text-left text-zinc-600 min-w-max" role="grid">
                    <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 sticky top-0 z-10 shadow-sm">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} role="row">
                          {headerGroup.headers.map(header => (
                            <th 
                              key={header.id} 
                              role="columnheader"
                              className="px-4 py-3 font-semibold whitespace-nowrap bg-zinc-50 border-b border-r border-zinc-200 last:border-r-0"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <motion.tbody 
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      {table.getRowModel().rows.map((row, index) => (
                        <motion.tr 
                          key={row.id} 
                          role="row"
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          className={`border-b border-zinc-100 last:border-0 hover:bg-zinc-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td 
                              key={cell.id} 
                              role="gridcell"
                              className="px-4 py-2.5 truncate max-w-[250px] border-r border-zinc-100 last:border-r-0" 
                              title={String(cell.getValue())}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </div>
              
              <p className="text-sm text-zinc-500 mt-4 text-center">
                Showing all {parsedData.rows.length} rows
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
