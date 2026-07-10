import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface ResultsToolbarProps {
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  searchInput: string;
  setSearchInput: (input: string) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
}

const statuses = [
  { label: "All", value: null },
  { label: "Good Lead", value: "GOOD_LEAD_FOLLOW_UP" },
  { label: "Sale Done", value: "SALE_DONE" },
  { label: "Bad Lead", value: "BAD_LEAD" },
  { label: "Did Not Connect", value: "DID_NOT_CONNECT" },
  { label: "Unknown", value: "UNKNOWN" },
];

export const ResultsToolbar = React.memo(function ResultsToolbar({
  statusFilter,
  setStatusFilter,
  searchInput,
  setSearchInput,
  globalFilter,
  setGlobalFilter
}: ResultsToolbarProps) {
  return (
    <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50">
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
            onClick={() => { setStatusFilter(null); setSearchInput(""); setGlobalFilter(""); }} 
            className="ml-2 text-zinc-500 hover:text-zinc-900 h-8"
          >
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="relative max-w-full lg:max-w-sm w-full lg:w-64 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search records..." 
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>
    </div>
  );
});
