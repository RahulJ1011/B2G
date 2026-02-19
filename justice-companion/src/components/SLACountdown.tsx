import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface SLACountdownProps {
  deadline: Date;
  breached: boolean;
}

export function SLACountdown({ deadline, breached }: SLACountdownProps) {
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (breached || remaining <= 0) {
    return (
      <span className="sla-breached inline-flex items-center gap-1 text-xs font-bold">
        <AlertTriangle className="h-3 w-3" /> BREACHED
      </span>
    );
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isWarning = remaining < 3600000;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-mono font-semibold", isWarning ? "sla-warning" : "sla-safe")}>
      <Clock className="h-3 w-3" />
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
