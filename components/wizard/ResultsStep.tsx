import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, AlertCircle, Percent, Download, 
  Search, ArrowUpDown, ChevronLeft, ChevronRight, FileX, Timer,
  Trophy, XCircle, PhoneOff, MinusCircle, Eye, Copy, ArrowUp, ArrowDown,
  Info, ChevronDown, ChevronUp, FileJson, FileText as FileTextIcon
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  FilterFn
} from "@tanstack/react-table";
import { toast } from "sonner";
import { downloadJson, downloadText } from "@/lib/download";

interface ResultsStepProps {
  importResult: any | null;
  onReset: () => void;
}

const customGlobalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const searchStr = String(filterValue).toLowerCase();
  const name = String(row.original.name || "").toLowerCase();
  const email = String(row.original.email || "").toLowerCase();
  const phone = `${row.original.country_code || ""} ${row.original.mobile_without_country_code || ""}`.toLowerCase();
  const company = String(row.original.company || "").toLowerCase();
  const status = String(row.original.crm_status || "Unknown").toLowerCase();
  
  return name.includes(searchStr) || email.includes(searchStr) || phone.includes(searchStr) || company.includes(searchStr) || status.includes(searchStr);
};

const TruncatedCell = ({ value }: { value: string }) => {
  if (!value || value === "-") return <span className="text-zinc-500">-</span>;
  return (
    <div className="group relative max-w-[140px] md:max-w-[180px]">
      <div className="truncate cursor-default" title={value}>{value}</div>
    </div>
  );
};

const SortHeader = ({ column, title }: { column: any, title: string }) => {
  const isSorted = column.getIsSorted();
  return (
    <Button 
      variant="ghost" 
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
      className="p-0 hover:bg-transparent font-semibold h-auto flex items-center"
      aria-label={`Sort by ${title}`}
    >
      {title}
      {isSorted === "asc" ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-blue-600" /> : 
       isSorted === "desc" ? <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-blue-600" /> : 
       <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </Button>
  );
};

const StatusBadge = ({ status }: { status?: string | null }) => {
  if (!status) {
    return (
      <Badge variant="secondary" className="font-medium whitespace-nowrap">
        <MinusCircle className="w-3 h-3 mr-1.5 opacity-70" /> Unknown
      </Badge>
    );
  }
  
  const s = status.toUpperCase();
  if (s === "GOOD_LEAD_FOLLOW_UP") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent font-medium whitespace-nowrap"><CheckCircle2 className="w-3 h-3 mr-1.5" /> GOOD LEAD</Badge>;
  }
  if (s === "SALE_DONE") {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent font-medium whitespace-nowrap"><Trophy className="w-3 h-3 mr-1.5" /> SALE DONE</Badge>;
  }
  if (s === "BAD_LEAD") {
    return <Badge variant="destructive" className="font-medium whitespace-nowrap"><XCircle className="w-3 h-3 mr-1.5" /> BAD LEAD</Badge>;
  }
  if (s === "DID_NOT_CONNECT") {
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-transparent font-medium whitespace-nowrap"><PhoneOff className="w-3 h-3 mr-1.5" /> NO CONNECT</Badge>;
  }
  return <Badge variant="secondary" className="font-medium whitespace-nowrap"><MinusCircle className="w-3 h-3 mr-1.5 opacity-70" /> {status}</Badge>;
};

export function ResultsStep({ importResult, onReset }: ResultsStepProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [isWarningsOpen, setIsWarningsOpen] = useState(false);

  if (!importResult) {
    return (
      <div className="w-full text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">No Results Found</h2>
        <Button onClick={onReset} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const {
    failedBatches,
    successfulBatches,
    imported,
    skipped,
    processingTime,
    records,
    warnings
  } = importResult;

  const totalProcessed = imported + skipped;
  const successRate = totalProcessed > 0 ? Math.round((imported / totalProcessed) * 100) : 0;
  const hasWarnings = (failedBatches && failedBatches > 0) || (warnings && warnings.length > 0);

  const filteredRecords = useMemo(() => {
    let result = records || [];
    if (statusFilter) {
      result = result.filter((r: any) => {
        const s = r.crm_status;
        if (statusFilter === "UNKNOWN") return !s;
        return s && s.toUpperCase() === statusFilter;
      });
    }
    return result;
  }, [records, statusFilter]);

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

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: customGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDownloadJson = () => {
    downloadJson(records, 'crm-imported-records.json');
    toast.success("JSON downloaded successfully.");
  };

  const handleDownloadFailed = () => {
    // Assuming warnings contain failed records or just returning the warning list as text
    if (!warnings || warnings.length === 0) {
      toast.info("No failed records to download.");
      return;
    }
    downloadText(warnings.join("\n"), 'failed-records-warnings.txt');
    toast.success("Failed records log downloaded.");
  };

  const handleDownloadReport = () => {
    const reportStr = `CSV Import Report
-------------------
Total Rows Processed: ${totalProcessed}
Successfully Imported: ${imported}
Skipped/Failed: ${skipped}
Success Rate: ${successRate}%
Processing Time: ${processingTime}ms
Successful Batches: ${successfulBatches || 0}
Failed Batches: ${failedBatches || 0}

Warnings/Errors:
${warnings && warnings.length > 0 ? warnings.map((w: string) => "- " + w).join("\n") : "None"}
`;
    downloadText(reportStr, 'import-report.txt');
    toast.success("Import report downloaded.");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  const statuses = [
    { label: "All", value: null },
    { label: "Good Lead", value: "GOOD_LEAD_FOLLOW_UP" },
    { label: "Sale Done", value: "SALE_DONE" },
    { label: "Bad Lead", value: "BAD_LEAD" },
    { label: "Did Not Connect", value: "DID_NOT_CONNECT" },
    { label: "Unknown", value: "UNKNOWN" },
  ];

  return (
    <motion.div
      key="results-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto px-4 relative"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">Import Results</h2>
        <p className="text-zinc-500 text-lg">Your CSV has been successfully analyzed and converted into CRM-ready records.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        {hasWarnings ? (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg shadow-sm overflow-hidden transition-all">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100/50"
              onClick={() => setIsWarningsOpen(!isWarningsOpen)}
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
                <h3 className="text-orange-800 font-medium">⚠ Import completed with warnings</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-800 hover:bg-orange-200/50">
                {isWarningsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <AnimatePresence>
              {isWarningsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-orange-100/50"
                >
                  <ul className="mt-3 text-sm text-orange-700 list-none space-y-2">
                    {warnings?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start bg-orange-100/30 p-2 rounded">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                    {(!warnings || warnings.length === 0) && failedBatches > 0 && (
                      <li className="flex items-start bg-orange-100/30 p-2 rounded">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>{failedBatches} batch(es) failed during processing.</span>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
            <span className="text-emerald-800 font-medium">Import completed successfully.</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          label="Total CSV Rows" 
          value={totalProcessed} 
          icon={<List className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatsCard 
          label="Imported Records" 
          value={imported} 
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatsCard 
          label="Skipped Records" 
          value={skipped} 
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-orange-50"
          iconTextColor="text-orange-600"
        />
        <StatsCard 
          label="Success Rate" 
          value={`${successRate}%`} 
          icon={<Percent className="w-5 h-5" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <StatsCard 
          label="Processing Time" 
          value={`${processingTime}ms`} 
          icon={<Timer className="w-5 h-5" />}
          iconBgColor="bg-zinc-100"
          iconTextColor="text-zinc-600"
        />
        {successfulBatches !== undefined && (
          <StatsCard 
            label="Successful Batches" 
            value={successfulBatches} 
            icon={<Trophy className="w-5 h-5" />}
            iconBgColor="bg-teal-50"
            iconTextColor="text-teal-600"
          />
        )}
        {failedBatches !== undefined && failedBatches > 0 && (
          <StatsCard 
            label="Failed Batches" 
            value={failedBatches} 
            icon={<XCircle className="w-5 h-5" />}
            iconBgColor="bg-red-50"
            iconTextColor="text-red-600"
          />
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-zinc-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-500 mr-2 flex items-center"><Filter className="w-4 h-4 mr-2" /> Quick Filters:</span>
            {statuses.map(s => (
              <Button 
                key={s.label} 
                variant={statusFilter === s.value ? "default" : "outline"}
                size="sm"
                className={`rounded-full transition-all h-8 ${statusFilter === s.value ? 'shadow-md bg-zinc-900' : 'bg-white hover:bg-zinc-100'}`}
                onClick={() => setStatusFilter(s.value)}
              >
                {s.label}
              </Button>
            ))}
            {(statusFilter !== null || globalFilter !== "") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setStatusFilter(null); setGlobalFilter(""); }} 
                className="ml-2 text-zinc-500 hover:text-zinc-900 h-8"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="relative max-w-sm w-full xl:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {filteredRecords.length > 0 ? (
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
                    <Button variant="outline" onClick={() => { setGlobalFilter(""); setStatusFilter(null); }}>
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
            {(statusFilter !== null || globalFilter !== "") && (
              <Button variant="outline" onClick={() => { setGlobalFilter(""); setStatusFilter(null); }}>
                Clear Filters
              </Button>
            )}
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

      {/* View Details Modal (Animated with Framer Motion) */}
      <AnimatePresence>
        {viewRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
              onClick={() => setViewRecord(null)}
              aria-hidden="true"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200"
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="modal-title"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="modal-title" className="text-xl font-bold text-zinc-900">Record Details</h3>
                    <p className="text-sm text-zinc-500">Complete parsed information for this lead.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewRecord(null)} className="rounded-full">
                  <XCircle className="w-5 h-5 text-zinc-400" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-zinc-50/50 flex-1">
                <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                  <pre className="p-4 text-sm text-zinc-800 overflow-x-auto whitespace-pre-wrap font-mono">
                    {JSON.stringify(viewRecord, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="p-4 border-t border-zinc-100 bg-white flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(viewRecord, null, 2));
                  toast.success("JSON copied to clipboard!");
                }}>
                  <Copy className="w-4 h-4 mr-2" /> Copy JSON
                </Button>
                <Button onClick={() => setViewRecord(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
