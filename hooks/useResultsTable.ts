import { useState, useMemo, useCallback } from "react";
import {
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  FilterFn
} from "@tanstack/react-table";
import { toast } from "sonner";
import { downloadJson, downloadText } from "@/lib/download";

const customGlobalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const searchStr = String(filterValue).toLowerCase();
  const name = String(row.original.name || "").toLowerCase();
  const email = String(row.original.email || "").toLowerCase();
  const phone = `${row.original.country_code || ""} ${row.original.mobile_without_country_code || ""}`.toLowerCase();
  const company = String(row.original.company || "").toLowerCase();
  const status = String(row.original.crm_status || "Unknown").toLowerCase();
  
  return name.includes(searchStr) || email.includes(searchStr) || phone.includes(searchStr) || company.includes(searchStr) || status.includes(searchStr);
};

export function useResultsTable(importResult: any, columns: ColumnDef<any>[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const {
    failedBatches = 0,
    successfulBatches = 0,
    imported = 0,
    skipped = 0,
    processingTime = 0,
    records = [],
    warnings = []
  } = importResult || {};

  const totalProcessed = useMemo(() => imported + skipped, [imported, skipped]);
  const successRate = useMemo(() => totalProcessed > 0 ? Math.round((imported / totalProcessed) * 100) : 0, [imported, totalProcessed]);
  const hasWarnings = useMemo(() => (failedBatches && failedBatches > 0) || (warnings && warnings.length > 0), [failedBatches, warnings]);

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

  const handleDownloadJson = useCallback(() => {
    downloadJson(records, 'crm-imported-records.json');
    toast.success("JSON downloaded successfully.");
  }, [records]);

  const handleDownloadFailed = useCallback(() => {
    if (!warnings || warnings.length === 0) {
      toast.info("No failed records to download.");
      return;
    }
    downloadText(warnings.join("\n"), 'failed-records-warnings.txt');
    toast.success("Failed records log downloaded.");
  }, [warnings]);

  const handleDownloadReport = useCallback(() => {
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
  }, [totalProcessed, imported, skipped, successRate, processingTime, successfulBatches, failedBatches, warnings]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setGlobalFilter("");
    setStatusFilter(null);
  }, []);

  return {
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
    globalFilter,
    setGlobalFilter,
    statusFilter,
    setStatusFilter,
    clearFilters,
    handleDownloadJson,
    handleDownloadFailed,
    handleDownloadReport
  };
}
