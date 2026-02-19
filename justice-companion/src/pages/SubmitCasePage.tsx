import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { submitCase } from "@/api/cases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Case } from "@/lib/types";

const crimeTypes = [
    "Theft", "Burglary", "Robbery", "Armed Robbery", "Assault",
    "Cyber Fraud", "Kidnapping", "Murder", "Domestic Violence",
    "Vandalism", "Drug Offense", "Traffic Violation", "Other",
];

export default function SubmitCasePage() {
    const navigate = useNavigate();
    const [crimeType, setCrimeType] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [incidentDatetime, setIncidentDatetime] = useState("");
    const [submittedCase, setSubmittedCase] = useState<Case | null>(null);

    const mutation = useMutation({
        mutationFn: submitCase,
        onSuccess: (data) => {
            toast.success("Case submitted successfully!");
            setSubmittedCase(data.case);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to submit case.");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!crimeType || !location || !description || !incidentDatetime) {
            toast.error("Please fill all fields.");
            return;
        }
        mutation.mutate({
            crime_type: crimeType,
            location,
            description,
            incident_datetime: incidentDatetime,
        });
    };

    if (submittedCase) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Case Submitted Successfully</h1>
                        <p className="text-muted-foreground">Your case has been filed and assigned.</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Case ID</p>
                            <p className="font-mono font-semibold">{submittedCase._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Crime Type</p>
                            <p className="font-medium">{submittedCase.crime_type}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">AI Severity</p>
                            <SeverityBadge severity={submittedCase.severity?.label || "LOW"} />
                        </div>
                        <div>
                            <p className="text-muted-foreground">SLA Deadline</p>
                            <p className="font-medium">{new Date(submittedCase.sla?.deadline).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Assigned Authority</p>
                            <p className="font-medium">{submittedCase.current_authority}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium">{submittedCase.status}</p>
                        </div>
                    </div>
                    {submittedCase.severity?.recommendation && (
                        <div className="pt-4 border-t">
                            <p className="text-muted-foreground text-sm">AI Recommendation</p>
                            <p className="text-sm">{submittedCase.severity.recommendation}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button onClick={() => navigate("/dashboard")} variant="outline">
                        Go to Dashboard
                    </Button>
                    <Button onClick={() => { setSubmittedCase(null); setCrimeType(""); setLocation(""); setDescription(""); setIncidentDatetime(""); }}>
                        Submit Another Case
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Submit a New Case</h1>
                <p className="text-muted-foreground">
                    Report a crime. Our AI will predict severity and assign it to the nearest police station.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-5">
                <div className="space-y-2">
                    <Label>Crime Type</Label>
                    <Select value={crimeType} onValueChange={setCrimeType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select crime type" />
                        </SelectTrigger>
                        <SelectContent>
                            {crimeTypes.map((ct) => (
                                <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Central Market, Sector 17" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the incident in detail..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="datetime">Incident Date & Time</Label>
                    <Input id="datetime" type="datetime-local" value={incidentDatetime} onChange={(e) => setIncidentDatetime(e.target.value)} />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {mutation.isPending ? "Analyzing & Submitting..." : "Submit Case"}
                </Button>
            </form>
        </motion.div>
    );
}
