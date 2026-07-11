import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, ChevronDown, Check } from "lucide-react";
import { FilterState } from "@/hooks/useResultsTable";

interface ResultsToolbarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  searchInput: string;
  setSearchInput: (input: string) => void;
  records: any[];
  clearFilters: () => void;
}

function useOnClickOutside(ref: React.RefObject<HTMLDivElement | null>, handler: (event: any) => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

function FilterDropdown({ 
  label, 
  options = [], 
  selectedValues = [], 
  onToggle 
}: { 
  label: string, 
  options: string[], 
  selectedValues: string[], 
  onToggle: (val: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(ref, () => setIsOpen(false));

  const isActive = selectedValues && selectedValues.length > 0;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        className={`rounded-full transition-all h-8 px-3 flex items-center gap-1.5 ${isActive ? 'shadow-md bg-zinc-900' : 'bg-white hover:bg-zinc-100'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        {isActive && (
          <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 leading-none flex items-center justify-center min-w-[1.25rem]">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 py-1.5 max-h-64 overflow-y-auto overflow-x-hidden">
          {(!options || options.length === 0) ? (
            <div className="px-3 py-2 text-sm text-zinc-500 italic">No options available</div>
          ) : (
            options.map(opt => {
              const isSelected = selectedValues && selectedValues.includes(opt);
              return (
                <div 
                  key={opt} 
                  className="flex items-center px-3 py-1.5 hover:bg-zinc-50 cursor-pointer group"
                  onClick={() => onToggle(opt)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 group-hover:border-blue-400'}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-zinc-700 truncate select-none" title={opt}>{opt}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export const ResultsToolbar = React.memo(function ResultsToolbar({
  filters,
  setFilters,
  searchInput,
  setSearchInput,
  records,
  clearFilters
}: ResultsToolbarProps) {

  const { statuses, countries, leadOwners, dataSources } = useMemo(() => {
    const s = new Set<string>();
    const c = new Set<string>();
    const l = new Set<string>();
    const d = new Set<string>();

    (records || []).forEach(r => {
      if (!r) return;
      s.add(r.crm_status ? String(r.crm_status).toUpperCase() : "UNKNOWN");
      c.add(r.country ? String(r.country) : "UNKNOWN");
      l.add(r.lead_owner ? String(r.lead_owner) : "UNKNOWN");
      d.add(r.data_source ? String(r.data_source) : "UNKNOWN");
    });

    return {
      statuses: Array.from(s).sort(),
      countries: Array.from(c).sort(),
      leadOwners: Array.from(l).sort(),
      dataSources: Array.from(d).sort()
    };
  }, [records]);

  const handleToggle = (key: keyof FilterState, val: string) => {
    setFilters(prev => {
      const current = prev[key];
      if (current.includes(val)) {
        return { ...prev, [key]: current.filter(v => v !== val) };
      } else {
        return { ...prev, [key]: [...current, val] };
      }
    });
  };

  const activeChips = useMemo(() => {
    const chips: { key: keyof FilterState, val: string, label: string }[] = [];
    if (filters) {
      (filters.crmStatus || []).forEach(v => chips.push({ key: 'crmStatus', val: v, label: `Status: ${v}` }));
      (filters.country || []).forEach(v => chips.push({ key: 'country', val: v, label: `Country: ${v}` }));
      (filters.leadOwner || []).forEach(v => chips.push({ key: 'leadOwner', val: v, label: `Owner: ${v}` }));
      (filters.dataSource || []).forEach(v => chips.push({ key: 'dataSource', val: v, label: `Source: ${v}` }));
    }
    return chips;
  }, [filters]);

  const hasAnyFilters = searchInput !== "" || activeChips.length > 0;

  return (
    <div className="flex flex-col border-b border-zinc-100 bg-zinc-50/50">
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-zinc-500 mr-2 flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filters:
          </span>
          
          <FilterDropdown 
            label="CRM Status" 
            options={statuses} 
            selectedValues={filters.crmStatus} 
            onToggle={(val) => handleToggle('crmStatus', val)} 
          />
          <FilterDropdown 
            label="Country" 
            options={countries} 
            selectedValues={filters.country} 
            onToggle={(val) => handleToggle('country', val)} 
          />
          <FilterDropdown 
            label="Lead Owner" 
            options={leadOwners} 
            selectedValues={filters.leadOwner} 
            onToggle={(val) => handleToggle('leadOwner', val)} 
          />
          <FilterDropdown 
            label="Data Source" 
            options={dataSources} 
            selectedValues={filters.dataSource} 
            onToggle={(val) => handleToggle('dataSource', val)} 
          />

          {hasAnyFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="ml-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 h-8"
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
      
      {activeChips.length > 0 && (
        <div className="px-4 sm:px-5 pb-4 pt-1 flex flex-wrap gap-2">
          {activeChips.map((chip, idx) => (
            <div 
              key={`${chip.key}-${chip.val}-${idx}`} 
              className="inline-flex items-center bg-white border border-zinc-200 rounded-full px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm"
            >
              <span className="truncate max-w-[200px]">{chip.label}</span>
              <button 
                onClick={() => handleToggle(chip.key, chip.val)}
                className="ml-2 p-0.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
