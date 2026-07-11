import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, ChevronLeft, ChevronRight, FileX,
  Eye, Copy, FileJson, FileText as FileTextIcon, Search, CheckCircle2
} from "lucide-react";
import { flexRender, ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SortHeader } from "@/components/ui/SortHeader";
import { TruncatedCell } from "@/components/ui/TruncatedCell";
import { useResultsTable } from "@/hooks/useResultsTable";
import { WarningPanel } from "./results/WarningPanel";
import { ImportStats } from "./results/ImportStats";
import { ResultsToolbar } from "./results/ResultsToolbar";
import { RecordDetailsModal } from "./results/RecordDetailsModal";

interface ResultsStepProps {
  importResult: any | null;
  onReset: () => void;
}

export const ResultsStep = React.memo(function ResultsStep({ importResult, onReset }: ResultsStepProps) {
  const [viewRecord, setViewRecord] = useState<any | null>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <SortHeader column={column} title="Name" />,
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortHeader column={column} title="Email" />,
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      id: "phone",
      header: "Phone",
      accessorFn: row => {
        const code = row.country_code || "";
        const mobile = row.mobile_without_country_code || "";
        return `${code} ${mobile}`.trim() || "-";
      },
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "company",
      header: ({ column }) => <SortHeader column={column} title="Company" />,
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "state",
      header: "State",
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "crm_status",
      header: ({ column }) => <SortHeader column={column} title="CRM Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.crm_status} />,
    },
    {
      accessorKey: "lead_owner",
      header: "Lead Owner",
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <SortHeader column={column} title="Created At" />,
      cell: info => <TruncatedCell value={info.getValue() as string} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setViewRecord(row.original)} 
              aria-label="View Details"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(row.original, null, 2));
                toast.success("JSON copied to clipboard!");
              }} 
              aria-label="Copy JSON"
              title="Copy JSON"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ], []);

  const {
    table,
    totalProcessed,
    successRate,
    hasWarnings,
    failedBatches,
    successfulBatches,
    imported,
    skipped,
    processingTime,
    records,
    warnings,
    searchInput,
    setSearchInput,
    filters,
    setFilters,
    clearFilters,
    handleDownloadJson,
    handleDownloadFailed,
    handleDownloadReport
  } = useResultsTable(importResult, columns);

  if (!importResult) {
    return (
      <div className="w-full text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">No Results Found</h2>
        <Button onClick={onReset} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      key="results-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto px-4 relative"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">Import Results</h2>
        <p className="text-zinc-500 text-sm sm:text-lg">Your CSV has been successfully analyzed and converted into CRM-ready records.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {hasWarnings ? (
          <WarningPanel warnings={warnings} failedBatches={failedBatches} />
        ) : (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            <span className="text-emerald-800 font-medium">Import completed successfully.</span>
          </div>
        )}
      </motion.div>

      <ImportStats 
        totalProcessed={totalProcessed}
        imported={imported}
        skipped={skipped}
        successRate={successRate}
        processingTime={processingTime}
        successfulBatches={successfulBatches}
        failedBatches={failedBatches}
        itemVariants={itemVariants}
      />

      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8 max-w-full">
        <ResultsToolbar 
          filters={filters}
          setFilters={setFilters}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          records={records}
          clearFilters={clearFilters}
        />

        {table.getRowModel().rows.length > 0 || (searchInput !== "" || Object.values(filters).some(f => f.length > 0)) ? (
          <>
            <div className="overflow-x-auto max-h-[600px] relative scroll-smooth custom-scrollbar">
              <table className="w-full text-sm text-left text-zinc-600 min-w-[1200px] table-auto">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/75 sticky top-0 z-10 shadow-sm border-b border-zinc-200">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap bg-transparent border-r border-zinc-200 last:border-r-0 group">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`group hover:bg-zinc-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 border-r border-zinc-100 last:border-r-0 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.getRowModel().rows.length === 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 mb-1">No matching records found</h3>
                    <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Try adjusting your search query or filters to find what you're looking for.</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Search & Filters
                    </Button>
                 </motion.div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between bg-zinc-50/50 gap-4">
              <span className="text-sm text-zinc-500 font-medium">
                Showing {table.getRowModel().rows.length} of {imported} imported records.
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 mr-2">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.previousPage()} 
                  disabled={!table.getCanPreviousPage()}
                  className="bg-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.nextPage()} 
                  disabled={!table.getCanNextPage()}
                  className="bg-white"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileX className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-1">No records imported</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-6">
              We couldn't extract any valid CRM records from this file. 
              {hasWarnings && " Check the warnings above for more details."}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mt-4">
        <Button variant="outline" size="lg" onClick={onReset} className="min-w-[200px] w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
          Import Another CSV
        </Button>
        {records && records.length > 0 && (
          <>
            <Button variant="outline" size="lg" className="gap-2 min-w-[200px] w-full sm:w-auto hover:bg-zinc-100 transition-transform hover:scale-105 active:scale-95" onClick={handleDownloadReport}>
              <FileTextIcon className="w-4 h-4 text-zinc-500" /> Download Report
            </Button>
            {hasWarnings && (
              <Button variant="outline" size="lg" className="gap-2 min-w-[200px] w-full sm:w-auto border-orange-200 text-orange-700 hover:bg-orange-50 transition-transform hover:scale-105 active:scale-95" onClick={handleDownloadFailed}>
                <AlertCircle className="w-4 h-4 text-orange-500" /> Download Failed Log
              </Button>
            )}
            <Button size="lg" className="gap-2 min-w-[200px] w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95" onClick={handleDownloadJson}>
              <FileJson className="w-4 h-4" /> Download JSON
            </Button>
          </>
        )}
      </motion.div>

      <RecordDetailsModal record={viewRecord} onClose={() => setViewRecord(null)} />
    </motion.div>
  );
});
