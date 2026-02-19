import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/StatsCard";
import { CaseTable } from "@/components/CaseTable";
import { EscalationTimeline } from "@/components/EscalationTimeline";
import { useAuthStore } from "@/store/authStore";
import { getDashboard } from "@/api/cases";
import { FileText, AlertTriangle, CheckCircle, Clock, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    refetchInterval: 30000, // refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your overview...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const cases = data?.cases || [];

  const slaBreaches = cases.filter((c) => c.sla?.breached).length;
  const escalatedCases = cases.filter((c) => c.escalationCount > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "User"}. Here's your overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Cases" value={stats?.total || 0} icon={FileText} />
        <StatsCard title="Critical" value={stats?.critical || 0} icon={AlertTriangle} variant="critical" />
        <StatsCard title="SLA Breaches" value={slaBreaches} icon={Clock} variant="warning" />
        <StatsCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle} variant="success" />
      </div>

      {/* Cases + Escalation Tracker */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Cases</h2>
            <span className="text-sm text-muted-foreground">{cases.length} cases</span>
          </div>
          <CaseTable cases={cases} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Escalation Tracker</h2>
          <div className="space-y-3">
            {escalatedCases.length === 0 && (
              <p className="text-sm text-muted-foreground">No escalated cases.</p>
            )}
            {escalatedCases.map((c) => (
              <div key={c._id} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-medium">{c._id.slice(-8).toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">Esc. ×{c.escalationCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.crime_type}</p>
                <EscalationTimeline current={c.current_authority} />
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Severity Breakdown</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical</span>
                <span className="font-semibold text-severity-critical">{stats?.critical || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High</span>
                <span className="font-semibold text-severity-high">{stats?.high || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-semibold text-severity-medium">{stats?.medium || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low</span>
                <span className="font-semibold text-severity-low">{stats?.low || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
