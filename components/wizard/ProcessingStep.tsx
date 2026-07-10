import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Circle, AlertCircle, Sparkles, Brain, WifiOff, Clock, ServerCrash, Bot, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importCSV } from "@/services/importService";

interface ProcessingStepProps {
  file: File;
  onBack: () => void;
  onNext: (result: any) => void;
}

const processingStages = [
  "Upload Complete",
  "Parsing CSV",
  "Mapping CRM Fields",
  "Extracting Leads",
  "Finalizing Import"
];

type ErrorType = "network" | "timeout" | "rate_limit" | "server" | "parse" | "unknown";

interface ErrorState {
  type: ErrorType;
  title: string;
  description: string;
}

export function ProcessingStep({ file, onBack, onNext }: ProcessingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  const isMountedRef = useRef(true);

  const categorizeError = (err: any): ErrorState => {
    const msg = (err?.message || "").toLowerCase();
    
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
      return { type: "network", title: "Connection Error", description: "Could not connect to the server. Please check your internet connection and try again." };
    }
    if (msg.includes("timeout") || msg.includes("abort")) {
      return { type: "timeout", title: "Request Timeout", description: "The server took too long to respond. The file might be too large or the server is busy." };
    }
    if (msg.includes("rate limit") || msg.includes("429") || msg.includes("quota")) {
      return { type: "rate_limit", title: "AI Service Busy", description: "The AI service is temporarily unavailable due to high demand. Please try again in a few minutes." };
    }
    if (msg.includes("500") || msg.includes("internal") || msg.includes("server error")) {
      return { type: "server", title: "Server Error", description: "An unexpected error occurred on our servers. Our team has been notified." };
    }
    if (msg.includes("parse") || msg.includes("csv")) {
      return { type: "parse", title: "CSV Processing Error", description: "We couldn't process your CSV file format. Please ensure it is properly formatted." };
    }
    
    return { type: "unknown", title: "Processing Failed", description: err?.message || "An unknown error occurred while importing your data." };
  };

  const getErrorIcon = (type: ErrorType) => {
    switch(type) {
      case "network": return <WifiOff className="w-8 h-8 text-red-500" />;
      case "timeout": return <Clock className="w-8 h-8 text-orange-500" />;
      case "rate_limit": return <Bot className="w-8 h-8 text-yellow-500" />;
      case "server": return <ServerCrash className="w-8 h-8 text-red-500" />;
      case "parse": return <XCircle className="w-8 h-8 text-red-500" />;
      default: return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const startImport = useCallback(async () => {
    setStatus("processing");
    setCurrentStep(0);
    setProgress(0);
    setErrorState(null);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const remaining = 90 - prev;
        return prev < 90 ? prev + remaining * 0.15 + 1 : prev;
      });
    }, 500);

    try {
      const result = await importCSV(file);
      if (!isMountedRef.current) return;
      
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      
      setCurrentStep(4);
      setProgress(100);
      setStatus("success");
      
      setTimeout(() => {
        if (isMountedRef.current) onNext(result);
      }, 600);
      
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      
      setStatus("error");
      setErrorState(categorizeError(err));
    }
  }, [file, onNext]);

  useEffect(() => {
    isMountedRef.current = true;
    startImport();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [startImport]);

  return (
    <motion.div
      key="processing-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden p-10 text-center relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {status === "error" && errorState ? (
            <motion.div 
              key="error-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                {getErrorIcon(errorState.type)}
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">{errorState.title}</h2>
              <p className="text-zinc-600 mb-8 max-w-sm text-sm">
                {errorState.description}
              </p>
              <div className="flex items-center gap-3 w-full justify-center">
                <Button variant="outline" onClick={onBack} className="transition-transform hover:scale-105 active:scale-95">
                  Back to Preview
                </Button>
                <Button onClick={startImport} className="transition-transform hover:scale-105 active:scale-95">
                  Retry Import
                </Button>
              </div>
            </motion.div>
          ) : (
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
              
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">AI is Processing Your CSV</h2>
              <p className="text-zinc-500 mb-8">
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
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
