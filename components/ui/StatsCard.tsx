import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
}

export function StatsCard({ 
  label, 
  value, 
  icon, 
  iconBgColor = 'bg-zinc-100', 
  iconTextColor = 'text-zinc-600' 
}: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3 overflow-hidden">
      <div className={`p-2 rounded-md shrink-0 ${iconBgColor} ${iconTextColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-900 truncate" title={String(value)}>
          {value}
        </p>
      </div>
    </div>
  );
}
