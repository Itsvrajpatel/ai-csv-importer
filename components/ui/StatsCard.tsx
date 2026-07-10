import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

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
  // Try to parse the numeric part for the animated counter
  const isNumberValue = typeof value === 'number';
  const stringValue = String(value);
  const numericMatch = !isNumberValue ? stringValue.match(/^([\d.]+)(.*)$/) : null;
  const numValue = isNumberValue ? value : (numericMatch ? Number(numericMatch[1]) : NaN);
  const suffix = numericMatch ? numericMatch[2] : "";

  return (
    <motion.div 
      className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center space-x-3 overflow-hidden group cursor-default"
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`p-2 rounded-md shrink-0 ${iconBgColor} ${iconTextColor} transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-zinc-900 truncate" title={String(value)}>
          {!isNaN(numValue) ? (
            <><AnimatedCounter value={numValue} />{suffix}</>
          ) : (
            value
          )}
        </p>
      </div>
    </motion.div>
  );
}
