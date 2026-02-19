import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { policeLogin } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PoliceLoginPage() {
    const [policeId, setPoliceId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        console.log("hi")
        if (!policeId || !password) {
            toast.error("Please enter Police ID and password");
            return;
        }
        setLoading(true);
        try {
            const res = await policeLogin(policeId, password);
            login(
                {
                    id: res.police.id,
                    name: res.police.name,
                    email: "",
                    role: res.police.role as any,
                    policeId: res.police.policeId,
                    stationName: res.police.stationName,
                    rank: res.police.rank,
                },
                res.token
            );
            toast.success(`Welcome, ${res.police.name}!`);
            navigate("/dashboard");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Login failed.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-primary px-16">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                    <Shield className="h-16 w-16 text-accent mb-6" />
                    <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
                        Police Officer<br />Portal Access
                    </h1>
                    <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
                        Access your assigned cases, manage SLA deadlines, and report case actions through the secure officer portal.
                    </p>
                </motion.div>
            </div>

            {/* Right panel */}
            <div className="flex flex-1 flex-col items-center justify-center px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-8 lg:hidden flex items-center gap-2">
                        <Shield className="h-8 w-8 text-accent" />
                        <span className="text-xl font-bold">AK Justice — Police</span>
                    </div>

                    <h2 className="text-2xl font-bold">Police Officer Login</h2>
                    <p className="mt-2 text-muted-foreground">Enter your Police ID and password</p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="policeId">Police ID</Label>
                            <Input id="policeId" type="text" placeholder="e.g. PO-2026-001" value={policeId} onChange={(e) => setPoliceId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full bg-primary text-primary-foreground rounded px-4 py-2"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-sm text-center text-muted-foreground">
                        Citizen or other user?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Standard Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}