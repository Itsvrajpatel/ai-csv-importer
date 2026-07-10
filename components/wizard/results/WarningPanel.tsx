import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface WarningPanelProps {
  warnings: string[];
  failedBatches: number;
}

export const WarningPanel = React.memo(function WarningPanel({ warnings, failedBatches }: WarningPanelProps) {
  const [isWarningsOpen, setIsWarningsOpen] = useState(false);

  return (
    <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg shadow-sm overflow-hidden transition-all">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-orange-100/50"
        onClick={() => setIsWarningsOpen(!isWarningsOpen)}
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
          <h3 className="text-orange-800 font-medium">⚠ Import completed with warnings</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-800 hover:bg-orange-200/50">
          {isWarningsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isWarningsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 border-t border-orange-100/50"
          >
            <ul className="mt-3 text-sm text-orange-700 list-none space-y-2">
              {warnings?.map((w: string, i: number) => (
                <li key={i} className="flex items-start bg-orange-100/30 p-2 rounded">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
              {(!warnings || warnings.length === 0) && failedBatches > 0 && (
                <li className="flex items-start bg-orange-100/30 p-2 rounded">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>{failedBatches} batch(es) failed during processing.</span>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
