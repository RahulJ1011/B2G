import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "@/api/notifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        refetchInterval: 15000,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("Failed to mark as read.");
        },
    });

    const notifications = data?.notifications || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">{notifications.length} notification(s)</p>
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`rounded-lg border bg-card p-4 flex items-start gap-3 transition-colors ${!n.isRead ? "border-accent/50 bg-accent/5" : ""
                                }`}
                        >
                            <Bell className={`h-5 w-5 mt-0.5 flex-shrink-0 ${!n.isRead ? "text-accent" : "text-muted-foreground"}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}>
                                    {n.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {!n.isRead && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markReadMutation.mutate(n._id)}
                                    disabled={markReadMutation.isPending}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
