import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStations, createStation } from "@/api/stations";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Loader2, Plus, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function StationsPage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [address, setAddress] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["stations"],
        queryFn: getStations,
    });

    const createMutation = useMutation({
        mutationFn: createStation,
        onSuccess: () => {
            toast.success("Station created!");
            queryClient.invalidateQueries({ queryKey: ["stations"] });
            setShowCreate(false);
            setName("");
            setLocation("");
            setAddress("");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create station.");
        },
    });

    const stations = data?.stations || [];
    const canCreate = user?.role === "SUPERIOR" || user?.role === "JUDICIARY";

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Police Stations</h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Police Stations</h1>
                    <p className="text-muted-foreground">{stations.length} registered station(s)</p>
                </div>
                {canCreate && (
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Station
                    </Button>
                )}
            </div>

            {stations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No stations registered yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stations.map((s) => (
                        <div key={s._id} className="rounded-lg border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-accent" />
                                <h3 className="font-semibold">{s.name}</h3>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {s.location || "N/A"}
                                </div>
                                <p>{s.address || "No address"}</p>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {s.officers?.length || 0} officers
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Station Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Station</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="stationName">Station Name</Label>
                            <Input id="stationName" placeholder="e.g. Central Police Station" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stationLocation">Location</Label>
                            <Input id="stationLocation" placeholder="Sector 17" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stationAddress">Address</Label>
                            <Input id="stationAddress" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button
                            onClick={() => createMutation.mutate({ name, location, address })}
                            disabled={createMutation.isPending || !name}
                        >
                            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
