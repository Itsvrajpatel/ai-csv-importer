import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";

interface RecordDetailsModalProps {
  record: any | null;
  onClose: () => void;
}

export const RecordDetailsModal = React.memo(function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
  return (
    <AnimatePresence>
      {record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200"
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-xl font-bold text-zinc-900">Record Details</h3>
                  <p className="text-sm text-zinc-500">Complete parsed information for this lead.</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <XCircle className="w-5 h-5 text-zinc-400" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-zinc-50/50 flex-1">
              <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                <pre className="p-4 text-sm text-zinc-800 overflow-x-auto whitespace-pre-wrap font-mono">
                  {JSON.stringify(record, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-100 bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(record, null, 2));
                toast.success("JSON copied to clipboard!");
              }}>
                <Copy className="w-4 h-4 mr-2" /> Copy JSON
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
