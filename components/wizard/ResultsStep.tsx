import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ParsedData } from "./types";
import { StatsCard } from "@/components/ui/StatsCard";
import { CheckCircle2, AlertCircle, Database, Percent, Download } from "lucide-react";

interface ResultsStepProps {
  parsedData: ParsedData | null;
  onReset: () => void;
}

export function ResultsStep({ parsedData, onReset }: ResultsStepProps) {
  const totalRecords = parsedData?.rows.length || 0;
  // Mock results for now
  const importedCount = Math.max(0, totalRecords - (totalRecords > 50 ? 2 : 0)); 
  const skippedCount = totalRecords - importedCount;
  const successRate = totalRecords > 0 ? Math.round((importedCount / totalRecords) * 100) : 0;

  return (
    <motion.div
      key="results-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Import Complete</h2>
        <p className="text-zinc-500 mt-2">Your CSV data has been successfully processed and imported.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          label="Imported" 
          value={importedCount} 
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatsCard 
          label="Skipped" 
          value={skippedCount} 
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-orange-50"
          iconTextColor="text-orange-600"
        />
        <StatsCard 
          label="Total Records" 
          value={totalRecords} 
          icon={<Database className="w-5 h-5" />}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatsCard 
          label="Success Rate" 
          value={`${successRate}%`} 
          icon={<Percent className="w-5 h-5" />}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Imported CRM Records</h3>
          <Button variant="outline" disabled size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Download JSON
          </Button>
        </div>
        <div className="p-12 text-center bg-zinc-50/50">
          <Database className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">Table placeholder</p>
          <p className="text-sm text-zinc-400 mt-1">Backend integration required to display final CRM mappings.</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onReset}>Import Another CSV</Button>
      </div>
    </motion.div>
  );
}
