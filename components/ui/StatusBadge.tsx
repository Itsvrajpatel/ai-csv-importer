import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trophy, XCircle, PhoneOff, MinusCircle } from "lucide-react";

interface StatusBadgeProps {
  status?: string | null;
}

export const StatusBadge = React.memo(function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="secondary" className="font-medium whitespace-nowrap">
        <MinusCircle className="w-3 h-3 mr-1.5 opacity-70" /> Unknown
      </Badge>
    );
  }
  
  const s = status.toUpperCase();
  if (s === "GOOD_LEAD_FOLLOW_UP") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent font-medium whitespace-nowrap">
        <CheckCircle2 className="w-3 h-3 mr-1.5" /> GOOD LEAD
      </Badge>
    );
  }
  if (s === "SALE_DONE") {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent font-medium whitespace-nowrap">
        <Trophy className="w-3 h-3 mr-1.5" /> SALE DONE
      </Badge>
    );
  }
  if (s === "BAD_LEAD") {
    return (
      <Badge variant="destructive" className="font-medium whitespace-nowrap">
        <XCircle className="w-3 h-3 mr-1.5" /> BAD LEAD
      </Badge>
    );
  }
  if (s === "DID_NOT_CONNECT") {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-transparent font-medium whitespace-nowrap">
        <PhoneOff className="w-3 h-3 mr-1.5" /> NO CONNECT
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-medium whitespace-nowrap">
      <MinusCircle className="w-3 h-3 mr-1.5 opacity-70" /> {status}
    </Badge>
  );
});
