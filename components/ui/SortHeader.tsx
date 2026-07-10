import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface SortHeaderProps {
  column: any;
  title: string;
}

export const SortHeader = React.memo(function SortHeader({ column, title }: SortHeaderProps) {
  const isSorted = column.getIsSorted();
  return (
    <Button 
      variant="ghost" 
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
      className="p-0 hover:bg-transparent font-semibold h-auto flex items-center group"
      aria-label={`Sort by ${title}`}
    >
      {title}
      {isSorted === "asc" ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-blue-600" /> : 
       isSorted === "desc" ? <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-blue-600" /> : 
       <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </Button>
  );
});
