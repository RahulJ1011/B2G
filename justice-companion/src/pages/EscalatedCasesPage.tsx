import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/api/cases";
import { CaseTable } from "@/components/CaseTable";
import { EscalationTimeline } from "@/components/EscalationTimeline";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function EscalatedCasesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["cases"],
        queryFn: getCases,
    });

    const cases = data?.cases?.filter((c) => c.escalationCount > 0 && c.status !== "RESOLVED") || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Escalated Cases</h1>
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Escalated Cases</h1>
                <p className="text-muted-foreground">
                    Cases that have breached SLA and been escalated. {cases.length} case(s) require attention.
                </p>
            </div>

            {cases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No escalated cases at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cases.map((c) => (
                        <div key={c._id} className="rounded-lg border bg-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-semibold">{c._id.slice(-8).toUpperCase()}</span>
                                    <SeverityBadge severity={c.severity?.label || "LOW"} />
                                    <span className="text-xs text-destructive font-medium">
                                        Escalated ×{c.escalationCount}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Crime: </span>
                                    <span className="font-medium">{c.crime_type}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Location: </span>
                                    <span>{c.location}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Reporter: </span>
                                    <span>{c.reporter_name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">SLA Breached: </span>
                                    <span className="text-destructive font-medium">{c.sla?.breached ? "Yes" : "No"}</span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">{c.description}</p>

                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Escalation Progress</p>
                                <EscalationTimeline current={c.current_authority} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
