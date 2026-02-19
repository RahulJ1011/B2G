import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CITIZEN");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            await registerUser(name, email, password, role);
            toast.success("Registration successful! Please log in.");
            navigate("/login");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Registration failed.";
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
                        Join the Justice<br />Management System
                    </h1>
                    <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
                        Register as a citizen to report crimes and track case progress with AI-powered severity prediction.
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
                        <span className="text-xl font-bold">AK Justice</span>
                    </div>

                    <h2 className="text-2xl font-bold">Create your account</h2>
                    <p className="mt-2 text-muted-foreground">Fill in your details to register</p>

                    <form onSubmit={handleRegister} className="mt-8 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CITIZEN">Citizen</SelectItem>
                                    <SelectItem value="JUDICIARY">Judiciary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>

                    <div className="mt-6 text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
