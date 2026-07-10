import React from "react";

interface TruncatedCellProps {
  value: string;
}

export const TruncatedCell = React.memo(function TruncatedCell({ value }: TruncatedCellProps) {
  if (!value || value === "-") return <span className="text-zinc-500">-</span>;
  return (
    <div className="group relative max-w-[140px] md:max-w-[180px]">
      <div className="truncate cursor-default" title={value}>{value}</div>
    </div>
  );
});
