import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, markCaseHandled } from "@/api/cases";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SLACountdown } from "@/components/SLACountdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Loader2, FileText, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AssignedCasesPage() {
    const queryClient = useQueryClient();
    const [selectedCase, setSelectedCase] = useState<string | null>(null);
    const [remarks, setRemarks] = useState("");
    const [actionTaken, setActionTaken] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["cases"],
        queryFn: getCases,
    });

    const handleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { remarks: string; actionTaken: string } }) =>
            markCaseHandled(id, data),
        onSuccess: () => {
            toast.success("Case marked as handled!");
            queryClient.invalidateQueries({ queryKey: ["cases"] });
            setSelectedCase(null);
            setRemarks("");
            setActionTaken("");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to handle case.");
        },
    });

    const cases = data?.cases?.filter((c) => c.status !== "RESOLVED") || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Assigned Cases</h1>
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Assigned Cases</h1>
                <p className="text-muted-foreground">Cases assigned to you. Mark them as handled when completed.</p>
            </div>

            {cases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No active cases assigned to you.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cases.map((c) => (
                        <div key={c._id} className="rounded-lg border bg-card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-semibold">{c._id.slice(-8).toUpperCase()}</span>
                                    <SeverityBadge severity={c.severity?.label || "LOW"} />
                                    <Badge variant="secondary">{c.status.replace("_", " ")}</Badge>
                                </div>
                                <SLACountdown deadline={new Date(c.sla?.deadline)} breached={c.sla?.breached || false} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Crime: </span>
                                    <span className="font-medium">{c.crime_type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span>{c.location}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Reporter: </span>
                                    <span>{c.reporter_name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Authority: </span>
                                    <span>{c.current_authority}</span>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">{c.description}</p>

                            <div className="flex justify-end pt-2 border-t">
                                {c.policeAction?.attendedAt ? (
                                    <span className="text-xs text-green-600 font-medium">✓ Already handled</span>
                                ) : (
                                    <Button size="sm" onClick={() => setSelectedCase(c._id)}>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Mark as Handled
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Handle Case Dialog */}
            <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Case as Handled</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="actionTaken">Action Taken</Label>
                            <Input
                                id="actionTaken"
                                placeholder="e.g. Arrested suspect, Filed FIR"
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Additional notes..."
                                rows={3}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCase(null)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (selectedCase) {
                                    handleMutation.mutate({
                                        id: selectedCase,
                                        data: { remarks, actionTaken },
                                    });
                                }
                            }}
                            disabled={handleMutation.isPending}
                        >
                            {handleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
