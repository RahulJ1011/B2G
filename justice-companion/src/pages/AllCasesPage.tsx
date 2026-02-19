import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/api/cases";
import { CaseTable } from "@/components/CaseTable";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function AllCasesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["cases"],
        queryFn: getCases,
    });

    const cases = data?.cases || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">All Cases</h1>
                <Skeleton className="h-64 rounded-lg" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">All Cases</h1>
                    <p className="text-muted-foreground">Comprehensive view of all cases in the system. {cases.length} total.</p>
                </div>
            </div>

            <CaseTable cases={cases} />
        </motion.div>
    );
}
