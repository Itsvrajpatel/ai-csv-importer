import React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle, Sparkles, Brain } from "lucide-react";

const processingStages = [
  "Upload Complete",
  "Parsing CSV",
  "Mapping CRM Fields",
  "Extracting Leads",
  "Finalizing Import"
];

interface ProcessingTimelineProps {
  status: "processing" | "success" | "error";
  currentStep: number;
  progress: number;
}

export const ProcessingTimeline = React.memo(function ProcessingTimeline({ status, currentStep, progress }: ProcessingTimelineProps) {
  return (
    <motion.div 
      key="processing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          <Sparkles className="w-4 h-4 text-blue-400 absolute top-2 right-2 animate-bounce" />
        </div>
      </div>
      
      <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-2">AI is Processing Your CSV</h2>
      <p className="text-sm sm:text-base text-zinc-500 mb-8">
        Analyzing your data and preparing CRM records.
      </p>

      <div className="w-full max-w-sm mx-auto mb-8">
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>
      
      <motion.div 
        className="text-left space-y-4 max-w-xs mx-auto w-full pl-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {processingStages.map((step, idx) => {
          const isCompleted = status === "success" || idx < currentStep;
          const isCurrent = status === "processing" && idx === currentStep;
          const isPending = status === "processing" && idx > currentStep;
          
          return (
            <motion.div 
              key={idx}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: isPending ? 0.4 : 1, x: 0 }
              }}
              className="flex items-center space-x-3"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
              )}
              <span className={`text-sm font-medium ${
                isCompleted ? "text-zinc-900" : 
                isCurrent ? "text-blue-600" : "text-zinc-400"
              }`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
});
