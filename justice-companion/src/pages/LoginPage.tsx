import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { loginUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(email, password);

      // ✅ Save token in localStorage
      localStorage.setItem("token", res.token);

      // Decode JWT
      const payload = JSON.parse(atob(res.token.split(".")[1]));

      login(
        {
          id: payload._id,
          name: email.split("@")[0],
          email,
          role: res.role,
        },
        res.token
      );

      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
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
            Justice Case<br />Management System
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
            AI-powered severity prediction with automatic SLA escalation. Ensuring accountability from report to resolution.
          </p>
          <div className="mt-10 flex gap-6">
            {[
              { label: "Cases Resolved", value: "12,847" },
              { label: "Avg Resolution", value: "18hrs" },
              { label: "SLA Compliance", value: "94.2%" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-accent">{stat.value}</p>
                <p className="text-sm text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
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

          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-muted-foreground">Enter your credentials to access the system</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-sm text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-muted-foreground">
              Police officer?{" "}
              <Link to="/police-login" className="text-primary font-medium hover:underline">
                Police Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
