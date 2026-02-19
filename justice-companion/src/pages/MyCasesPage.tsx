import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases } from "@/api/cases";
import { confirmCaseResolved } from "@/api/cases";
import { CaseTable } from "@/components/CaseTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SLACountdown } from "@/components/SLACountdown";
import { EscalationTimeline } from "@/components/EscalationTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MyCasesPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["cases"],
        queryFn: getCases,
    });

    const confirmMutation = useMutation({
        mutationFn: (id: string) => confirmCaseResolved(id),
        onSuccess: () => {
            toast.success("Resolution confirmed!");
            queryClient.invalidateQueries({ queryKey: ["cases"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to confirm.");
        },
    });

    const cases = data?.cases || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Cases</h1>
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Cases</h1>
                <p className="text-muted-foreground">Track your reported cases and confirm resolutions.</p>
            </div>

            {cases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">You haven't reported any cases yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cases.map((c) => (
                        <div key={c._id} className="rounded-lg border bg-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-semibold">{c._id.slice(-8).toUpperCase()}</span>
                                    <SeverityBadge severity={c.severity?.label || "LOW"} />
                                    <Badge variant={c.status === "RESOLVED" ? "outline" : "default"}>
                                        {c.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                <SLACountdown deadline={new Date(c.sla?.deadline)} breached={c.sla?.breached || false} />
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
                            </div>

                            <p className="text-sm text-muted-foreground">{c.description}</p>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <EscalationTimeline current={c.current_authority} />

                                {c.policeAction?.attendedAt && !c.confirmed_by_citizen && c.status !== "RESOLVED" && (
                                    <Button
                                        size="sm"
                                        onClick={() => confirmMutation.mutate(c._id)}
                                        disabled={confirmMutation.isPending}
                                    >
                                        {confirmMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                        )}
                                        Confirm Resolution
                                    </Button>
                                )}

                                {c.confirmed_by_citizen && (
                                    <span className="text-xs text-green-600 font-medium">✓ You confirmed resolution</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
