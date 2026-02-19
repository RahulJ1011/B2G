import { cn } from "@/lib/utils";
import { Shield, UserCheck, Scale } from "lucide-react";
import type { AuthorityLevel } from "@/lib/types";

const steps: { key: AuthorityLevel; label: string; icon: typeof Shield }[] = [
  { key: "POLICE", label: "Police", icon: Shield },
  { key: "SUPERIOR", label: "Superior", icon: UserCheck },
  { key: "JUDICIARY", label: "Judiciary", icon: Scale },
];

export function EscalationTimeline({ current }: { current: AuthorityLevel }) {
  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isActive = i <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-6 rounded-full", isActive && i < currentIdx ? "bg-accent" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
