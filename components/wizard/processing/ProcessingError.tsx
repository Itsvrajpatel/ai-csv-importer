import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, WifiOff, Clock, ServerCrash, Bot, XCircle } from "lucide-react";

export type ErrorType = "network" | "timeout" | "rate_limit" | "server" | "parse" | "unknown";

export interface ErrorState {
  type: ErrorType;
  title: string;
  description: string;
}

export const categorizeError = (err: any): ErrorState => {
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

interface ProcessingErrorProps {
  errorState: ErrorState;
  onBack: () => void;
  onRetry: () => void;
}

export const ProcessingError = React.memo(function ProcessingError({ errorState, onBack, onRetry }: ProcessingErrorProps) {
  return (
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
      <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-2">{errorState.title}</h2>
      <p className="text-zinc-600 mb-8 max-w-sm text-sm">
        {errorState.description}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
          Back to Preview
        </Button>
        <Button onClick={onRetry} className="w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
          Retry Import
        </Button>
      </div>
    </motion.div>
  );
});
