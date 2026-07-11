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

export interface FilterState {
  crmStatus: string[];
  country: string[];
  leadOwner: string[];
  dataSource: string[];
}

export function useResultsTable(importResult: any, columns: ColumnDef<any>[]) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    crmStatus: [],
    country: [],
    leadOwner: [],
    dataSource: []
  });

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
    
    if (searchInput) {
      const lowerSearch = searchInput.toLowerCase();
      result = result.filter((r: any) => {
        if (!r) return false;
        const fields = [
          r.name, r.email, r.company, r.city, r.state, r.country,
          r.lead_owner, r.crm_status, r.crm_note, r.data_source,
          r.description, r.mobile_without_country_code,
          r.country_code ? `${r.country_code} ${r.mobile_without_country_code}` : null
        ];
        return fields.some(f => String(f || "").toLowerCase().includes(lowerSearch));
      });
    }

    if (filters.crmStatus && filters.crmStatus.length > 0) {
      result = result.filter((r: any) => r && filters.crmStatus.includes(r.crm_status ? String(r.crm_status).toUpperCase() : "UNKNOWN"));
    }
    if (filters.country && filters.country.length > 0) {
      result = result.filter((r: any) => r && filters.country.includes(r.country ? String(r.country) : "UNKNOWN"));
    }
    if (filters.leadOwner && filters.leadOwner.length > 0) {
      result = result.filter((r: any) => r && filters.leadOwner.includes(r.lead_owner ? String(r.lead_owner) : "UNKNOWN"));
    }
    if (filters.dataSource && filters.dataSource.length > 0) {
      result = result.filter((r: any) => r && filters.dataSource.includes(r.data_source ? String(r.data_source) : "UNKNOWN"));
    }

    return result;
  }, [records, searchInput, filters]);

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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
    setFilters({ crmStatus: [], country: [], leadOwner: [], dataSource: [] });
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
    filters,
    setFilters,
    clearFilters,
    handleDownloadJson,
    handleDownloadFailed,
    handleDownloadReport
  };
}
