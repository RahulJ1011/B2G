import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const severityConfig: Record<Severity, { label: string; className: string }> = {
  CRITICAL: { label: "Critical", className: "severity-critical" },
  HIGH: { label: "High", className: "severity-high" },
  MEDIUM: { label: "Medium", className: "severity-medium" },
  LOW: { label: "Low", className: "severity-low" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.LOW;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}
