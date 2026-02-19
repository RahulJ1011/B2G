import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge } from "./SeverityBadge";
import { SLACountdown } from "./SLACountdown";
import { Badge } from "@/components/ui/badge";
import type { Case } from "@/lib/types";
import { MapPin } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "default",
  IN_PROGRESS: "secondary",
  RESOLVED: "outline",
};

export function CaseTable({ cases }: { cases: Case[] }) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Case ID</TableHead>
            <TableHead className="font-semibold">Crime Type</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Severity</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">SLA</TableHead>
            <TableHead className="font-semibold">Authority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No cases found.
              </TableCell>
            </TableRow>
          )}
          {cases.map((c) => (
            <TableRow key={c._id} className="cursor-pointer transition-colors hover:bg-muted/50">
              <TableCell className="font-mono text-sm font-medium">
                {c._id.slice(-8).toUpperCase()}
              </TableCell>
              <TableCell className="font-medium">{c.crime_type}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {c.location}
                </span>
              </TableCell>
              <TableCell>
                <SeverityBadge severity={c.severity?.label || "LOW"} />
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[c.status] || "default"}>
                  {c.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <SLACountdown
                  deadline={new Date(c.sla?.deadline)}
                  breached={c.sla?.breached || false}
                />
              </TableCell>
              <TableCell className="text-sm">{c.current_authority}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
