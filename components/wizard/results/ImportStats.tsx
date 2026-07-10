import React from "react";
import { motion } from "framer-motion";
import { ImportSummaryCard } from "@/components/ui/ImportSummaryCard";
import { List, CheckCircle2, AlertCircle, Percent, Timer, Trophy, XCircle } from "lucide-react";

interface ImportStatsProps {
  totalProcessed: number;
  imported: number;
  skipped: number;
  successRate: number;
  processingTime: number;
  successfulBatches?: number;
  failedBatches?: number;
  itemVariants: any;
}

export const ImportStats = React.memo(function ImportStats({
  totalProcessed,
  imported,
  skipped,
  successRate,
  processingTime,
  successfulBatches,
  failedBatches,
  itemVariants
}: ImportStatsProps) {
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      <ImportSummaryCard 
        label="Total CSV Rows" 
        value={totalProcessed} 
        icon={<List className="w-5 h-5" />}
        iconBgColor="bg-blue-50"
        iconTextColor="text-blue-600"
      />
      <ImportSummaryCard 
        label="Imported Records" 
        value={imported} 
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconBgColor="bg-emerald-50"
        iconTextColor="text-emerald-600"
      />
      <ImportSummaryCard 
        label="Skipped Records" 
        value={skipped} 
        icon={<AlertCircle className="w-5 h-5" />}
        iconBgColor="bg-orange-50"
        iconTextColor="text-orange-600"
      />
      <ImportSummaryCard 
        label="Success Rate" 
        value={`${successRate}%`} 
        icon={<Percent className="w-5 h-5" />}
        iconBgColor="bg-purple-50"
        iconTextColor="text-purple-600"
      />
      <ImportSummaryCard 
        label="Processing Time" 
        value={`${processingTime}ms`} 
        icon={<Timer className="w-5 h-5" />}
        iconBgColor="bg-zinc-100"
        iconTextColor="text-zinc-600"
      />
      {successfulBatches !== undefined && (
        <ImportSummaryCard 
          label="Successful Batches" 
          value={successfulBatches} 
          icon={<Trophy className="w-5 h-5" />}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-600"
        />
      )}
      {failedBatches !== undefined && failedBatches > 0 && (
        <ImportSummaryCard 
          label="Failed Batches" 
          value={failedBatches} 
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="bg-red-50"
          iconTextColor="text-red-600"
        />
      )}
    </motion.div>
  );
});
