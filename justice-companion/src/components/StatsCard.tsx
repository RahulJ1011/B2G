import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "critical" | "warning" | "success";
}

const variantStyles = {
  default: "border-border",
  critical: "border-severity-critical/30 bg-[hsl(var(--severity-critical)/0.05)]",
  warning: "border-severity-high/30 bg-[hsl(var(--severity-high)/0.05)]",
  success: "border-severity-low/30 bg-[hsl(var(--severity-low)/0.05)]",
};

const iconVariantStyles = {
  default: "text-muted-foreground",
  critical: "text-severity-critical",
  warning: "text-severity-high",
  success: "text-severity-low",
};

export function StatsCard({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 transition-shadow hover:shadow-md", variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={cn("h-5 w-5", iconVariantStyles[variant])} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-card-foreground">{value}</span>
        {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
      </div>
    </div>
  );
}
